# x402 支付协议核心实现

## 协议原理

x402 是一个基于 HTTP 的支付协议，让服务方能够以 402 Payment Required 状态码响应请求，引导客户端完成支付。

### 核心流程

```
1. Client → Server: GET /api/resource
2. Server → Client: 402 Payment Required
   - X402-Payment: { amount, token, deadline }
   - X402-Pay-Url: https://pay.gateway/pay
3. Client → Payment Gateway: POST /pay { payment }
4. Gateway → Client: 200 OK { payment_token }
5. Client → Server: GET /api/resource
   - X402-Token: { payment_token }
6. Server → Client: 200 OK { data }
```

## Golang 实现

### 1. 客户端

```go
package x402

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
)

type Client struct {
    httpClient *http.Client
    wallet    Wallet
    gateway   string
}

type PaymentRequest struct {
    Amount    string            `json:"amount"`
    Currency  string            `json:"currency"`
    Recipient string            `json:"recipient"`
    Deadline int64             `json:"deadline"`
    Data      string            `json:"data,omitempty"`
}

type PaymentToken struct {
    ID        string `json:"id"`
    Amount    string `json:"amount"`
    ExpiresAt int64  `json:"expires_at"`
}

// 创建支付
func (c *Client) CreatePayment(req *PaymentRequest) (*PaymentToken, error) {
    body, err := json.Marshal(req)
    if err != nil {
        return nil, err
    }
    
    resp, err := c.httpClient.Post(
        c.gateway + "/api/v1/payments",
        "application/json",
        bytes.NewReader(body),
    )
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()
    
    if resp.StatusCode != http.StatusOK {
        return nil, fmt.Errorf("payment failed: %d", resp.StatusCode)
    }
    
    var token PaymentToken
    if err := json.NewDecoder(resp.Body).Decode(&token); err != nil {
        return nil, err
    }
    
    return &token, nil
}

// 带支付调用 API
func (c *Client) CallWithPayment(url string, method string) (*http.Response, error) {
    // 1. 发起请求
    req, _ := http.NewRequest(method, url, nil)
    resp, err := c.httpClient.Do(req)
    if err != nil {
        return nil, err
    }
    
    // 2. 检查是否需要支付
    if resp.StatusCode == http.StatusPaymentRequired {
        // 解析支付信息
        paymentHeader := resp.Header.Get("X402-Payment")
        var paymentReq PaymentRequest
        json.Unmarshal([]byte(paymentHeader), &paymentReq)
        
        // 3. 创建支付
        token, err := c.CreatePayment(&paymentReq)
        if err != nil {
            return nil, err
        }
        
        // 4. 重新请求
        req, _ := http.NewRequest(method, url, nil)
        req.Header.Set("X402-Token", token.ID)
        return c.httpClient.Do(req)
    }
    
    return resp, nil
}
```

### 2. 服务器端

```go
package x402

import (
    "encoding/json"
    "fmt"
    "net/http"
)

type Server struct {
    facilitator string
    prices      map[string]*Price
}

type Price struct {
    Amount   string `json:"amount"`
    Currency string `json:"currency"`
}

// 中间件：检查支付
func (s *Server) PaymentMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // 获取端点价格
        price := s.getPrice(r.URL.Path)
        if price == nil {
            next.ServeHTTP(w, r)
            return
        }
        
        // 检查支付头
        token := r.Header.Get("X402-Token")
        if token == "" {
            // 返回 402
            s.send402(w, price, r)
            return
        }
        
        // 验证 token
        valid, err := s.verifyToken(token, r.RemoteAddr)
        if err != nil || !valid {
            s.send402(w, price, r)
            return
        }
        
        // 验证通过，继续
        next.ServeHTTP(w, r)
    })
}

func (s *Server) send402(w http.ResponseWriter, price *Price, r *http.Request) {
    paymentReq := map[string]interface{}{
        "scheme":    "erc20",
        "amount":    price.Amount,
        "currency":  price.Currency,
        "recipient": s.getRecipient(r.URL.Path),
        "deadline":  300, // 5分钟
    }
    
    paymentJSON, _ := json.Marshal(paymentReq)
    
    w.Header().Set("X402-Payment", string(paymentJSON))
    w.Header().Set("X402-Pay-Url", s.facilitator+"/pay")
    w.WriteHeader(http.StatusPaymentRequired)
    fmt.Fprintf(w, `{"error": "Payment Required", "amount": "%s"}`, price.Amount)
}

func (s *Server) verifyToken(token string, payer string) (bool, error) {
    // 调用 facilitator 验证
    // 实际实现需要与 blockchain 交互
    return true, nil
}
```

### 3. Facilitator 合约 (Solidity)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract X402Facet is Ownable {
    event PaymentCreated(
        bytes32 indexed paymentId,
        address indexed payer,
        address indexed recipient,
        uint256 amount,
        address token
    );
    
    event PaymentSettled(bytes32 indexed paymentId);
    
    struct Payment {
        address payer;
        address recipient;
        uint256 amount;
        address token;
        bool settled;
        uint256 createdAt;
    }
    
    mapping(bytes32 => Payment) public payments;
    mapping(address => mapping(bytes32 => bool)) public payers;
    
    // 创建支付
    function createPayment(
        address _recipient,
        uint256 _amount,
        address _token
    ) external returns (bytes32) {
        bytes32 paymentId = keccak256(
            abi.encodePacked(
                msg.sender,
                _recipient,
                _amount,
                block.timestamp
            )
        );
        
        payments[paymentId] = Payment({
            payer: msg.sender,
            recipient: _recipient,
            amount: _amount,
            token: _token,
            settled: false,
            createdAt: block.timestamp
        });
        
        // 转账代币
        require(
            IERC20(_token).transferFrom(
                msg.sender,
                address(this),
                _amount
            ),
            "Transfer failed"
        );
        
        emit PaymentCreated(paymentId, msg.sender, _recipient, _amount, _token);
        
        return paymentId;
    }
    
    // 结算支付
    function settlePayment(bytes32 _paymentId) external {
        Payment storage payment = payments[_paymentId];
        require(!payment.settled, "Already settled");
        
        // 转账给接收方
        require(
            IERC20(payment.token).transfer(
                payment.recipient,
                payment.amount
            ),
            "Transfer failed"
        );
        
        payment.settled = true;
        
        emit PaymentSettled(_paymentId);
    }
}
```

---

*x402 支付协议核心实现 v1.0*
