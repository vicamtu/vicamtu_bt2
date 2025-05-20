// Khai báo địa chỉ hợp đồng NFT trên mạng BASE Mainnet
const CONTRACT_ADDRESS = '0x0e381cd73faa421066dc5e2829a973405352168c';

// ABI (Application Binary Interface) tối thiểu để đọc thông tin NFT
const MIN_ABI = [
    // Hàm lấy số lượng token của một địa chỉ
    'function balanceOf(address owner) view returns (uint256)',
    // Hàm lấy ID token theo index
    'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
    // Hàm lấy URI metadata của token
    'function tokenURI(uint256 tokenId) view returns (string)',
    // Hàm lấy tên của NFT
    'function name() view returns (string)'
];

// Khởi tạo các phần tử khi trang được tải
function initializeApp() {
    // Lấy các phần tử HTML cần thiết
    const searchButton = document.getElementById('searchButton');
    const walletInput = document.getElementById('walletAddress');
    const errorMessage = document.getElementById('errorMessage');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const nftContainer = document.getElementById('nftContainer');

    // Thêm sự kiện click cho nút tìm kiếm
    searchButton.addEventListener('click', async () => {
        // Lấy địa chỉ ví từ input
        const walletAddress = walletInput.value.trim();

        // Kiểm tra địa chỉ ví có hợp lệ không
        if (!ethers.utils.isAddress(walletAddress)) {
            errorMessage.textContent = 'Địa chỉ ví không hợp lệ! Vui lòng kiểm tra lại.';
            return;
        }

        try {
            // Xóa thông báo lỗi cũ và hiển thị loading
            errorMessage.textContent = '';
            loadingSpinner.classList.remove('d-none');
            nftContainer.innerHTML = '';

            // Kết nối đến mạng BASE Mainnet
            const provider = new ethers.providers.JsonRpcProvider('https://mainnet.base.org');
            
            // Tạo instance của hợp đồng NFT
            const contract = new ethers.Contract(CONTRACT_ADDRESS, MIN_ABI, provider);

            // Lấy số lượng NFT của ví
            const balance = await contract.balanceOf(walletAddress);

            if (balance.toNumber() === 0) {
                errorMessage.textContent = 'Địa chỉ ví này không sở hữu NFT nào trong bộ sưu tập này.';
                return;
            }

            // Lấy tên bộ sưu tập NFT
            const collectionName = await contract.name();

            // Lấy thông tin từng NFT
            for (let i = 0; i < balance.toNumber(); i++) {
                try {
                    // Lấy ID của NFT
                    const tokenId = await contract.tokenOfOwnerByIndex(walletAddress, i);
                    
                    // Lấy URI metadata của NFT
                    const tokenURI = await contract.tokenURI(tokenId);
                    
                    // Lấy metadata của NFT
                    const response = await fetch(tokenURI);
                    const metadata = await response.json();

                    // Tạo card hiển thị NFT
                    const nftCard = document.createElement('div');
                    nftCard.className = 'col-md-4 mb-4';
                    nftCard.innerHTML = `
                        <div class="card nft-card">
                            <img src="${metadata.image}" class="card-img-top nft-image" alt="${metadata.name}">
                            <div class="card-body">
                                <h5 class="card-title">${metadata.name}</h5>
                                <p class="card-text">ID: ${tokenId}</p>
                                <p class="card-text">Bộ sưu tập: ${collectionName}</p>
                                ${metadata.description ? `<p class="card-text">${metadata.description}</p>` : ''}
                            </div>
                        </div>
                    `;

                    nftContainer.appendChild(nftCard);
                } catch (err) {
                    console.error('Lỗi khi lấy thông tin NFT:', err);
                }
            }
        } catch (err) {
            console.error('Lỗi:', err);
            errorMessage.textContent = 'Có lỗi xảy ra khi tải thông tin NFT. Vui lòng thử lại sau.';
        } finally {
            // Ẩn loading spinner
            loadingSpinner.classList.add('d-none');
        }
    });
};

// Xuất hàm để sử dụng trong môi trường Node.js
module.exports = { initializeApp };