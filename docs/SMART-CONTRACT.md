# x402 智能合约实现详解

## 支付合约架构

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title X402PaymentReceiver
 * @notice 接收 x402 支付的智能合约
 */
contract X402PaymentReceiver is Ownable, ReentrancyGuard {
    
    // 事件
    event PaymentReceived(
        address indexed from,
        uint256 amount,
        bytes32 indexed paymentId,
        string endpoint
    );
    
    event Withdrawal(address indexed to, uint256 amount);
    
    // 状态变量
    mapping(bytes32 => PaymentInfo) public payments;
    address public facilitator;
    IERC20 public immutable usdc;
    
    struct PaymentInfo {
        address payer;
        uint256 amount;
        string endpoint;
        bool settled;
        uint256 timestamp;
    }
    
    constructor(address _usdc, address _facilitator) {
        usdc = IERC20(_usdc);
        facilitator = _facilitator;
    }
    
    /**
     * @notice 接收支付
     */
    function receivePayment(
        bytes32 paymentId,
        uint256 amount,
        string calldata endpoint,
        address payer
    ) external onlyFacilitator nonReentrant {
        require(!payments[paymentId].settled, "Payment already settled");
        
        // 从payer转移USDC到合约
        require(
            usdc.transferFrom(payer, address(this), amount),
            "USDC transfer failed"
        );
        
        payments[paymentId] = PaymentInfo({
            payer: payer,
            amount: amount,
            endpoint: endpoint,
            settled: true,
            timestamp: block.timestamp
        });
        
        emit PaymentReceived(payer, amount, paymentId, endpoint);
    }
    
    /**
     * @notice 提现收益
     */
    function withdraw(uint256 amount) external onlyOwner {
        require(amount <= usdc.balanceOf(address(this)), "Insufficient balance");
        require(usdc.transfer(owner(), amount));
        emit Withdrawal(owner(), amount);
    }
    
    modifier onlyFacilitator() {
        require(msg.sender == facilitator, "Only facilitator");
        _;
    }
}
```

## 验证合约

```solidity
/**
 * @title X402Verifier
 * @notice 验证 x402 支付凭证
 */
contract X402Verifier {
    
    bytes32 public constant DOMAIN_SEPARATOR = keccak256(
        abi.encode(
            keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
            keccak256("X402Payment"),
            keccak256("1"),
            block.chainid,
            address(this)
        )
    );
    
    bytes32 public constant PAYMENT_TYPEHASH = keccak256(
        abi.encodePacked(
            "Payment(",
            "address payer,",
            "uint256 amount,",
            "string endpoint,",
            "bytes32 nonce,",
            "uint256 deadline",
            ")"
        )
    );
    
    /**
     * @notice 验证支付签名
     */
    function verifyPayment(
        Payment memory payment,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public view returns (bool) {
        // 检查截止时间
        if (payment.deadline < block.timestamp) {
            return false;
        }
        
        // 构建 hash
        bytes32 structHash = keccak256(
            abi.encode(
                PAYMENT_TYPEHASH,
                payment.payer,
                payment.amount,
                keccak256(abi.encode(payment.endpoint)),
                payment.nonce,
                payment.deadline
            )
        );
        
        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash)
        );
        
        // 验证签名
        address signer = ecrecover(digest, v, r, s);
        return signer == payment.payer;
    }
    
    struct Payment {
        address payer;
        uint256 amount;
        string endpoint;
        bytes32 nonce;
        uint256 deadline;
    }
}
```

---

*x402 智能合约 v1.0*
