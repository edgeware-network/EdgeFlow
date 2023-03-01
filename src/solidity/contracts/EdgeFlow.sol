pragma solidity ^0.8.0;

// Import necessary libraries
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

// Import the Flow NFT contract ABI
import "./FlowNFT.json";

contract EdgeFlow is ERC721Holder {
    // Declare variables
    address public ethNFTContract;
    address public flowNFTContract;
    uint256 public nonce;

    // Declare events
    event CrossChainTransfer(uint256 indexed tokenId, address indexed sender, bytes32 indexed flowAddress);

    // Set up the contract by defining the Ethereum NFT contract and the Flow NFT contract
    constructor(address _ethNFTContract, address _flowNFTContract) {
        ethNFTContract = _ethNFTContract;
        flowNFTContract = _flowNFTContract;
    }

    // Function for transferring an Ethereum NFT to Flow
    function transferToFlow(uint256 _tokenId, bytes32 _flowAddress, string memory _metadataURI) external {
        // Get the token from the sender
        IERC721(ethNFTContract).safeTransferFrom(msg.sender, address(this), _tokenId);

        // Increment nonce for unique ID
        nonce++;

        // Approve Flow NFT contract to receive the token
        IERC721(ethNFTContract).approve(flowNFTContract, _tokenId);

        // Call the Flow NFT contract to mint the new NFT with metadata
        FlowNFT(flowNFTContract).mintWithMetadata(_tokenId, _flowAddress, nonce, _metadataURI);

        // Emit event for tracking
        emit CrossChainTransfer(_tokenId, msg.sender, _flowAddress);
    }
}
