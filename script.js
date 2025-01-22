// Funções de utilidade
function formatPhoneNumber(phone) {
    let cleaned = phone.replace(/\D/g, '');
    if (!cleaned.startsWith('55')) {
        cleaned = '55' + cleaned;
    }
    return cleaned;
}

// Gerenciamento de estado
let activeNumbers = JSON.parse(localStorage.getItem('activeNumbers')) || [];

// Event Listeners
document.getElementById('whatsappForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    let phoneNumber = document.getElementById('phoneNumber').value.trim();
    const operator = document.getElementById('operator').value.trim();
    const message = document.getElementById('message').value.trim() || "oii vi seu anuncio";

    // Validação do número
    phoneNumber = formatPhoneNumber(phoneNumber);
    if (phoneNumber.length < 12) {
        alert('Número de telefone inválido! Digite um número válido com DDD.');
        return;
    }

    // Verifica duplicatas
    if (activeNumbers.some(item => item.phoneNumber === phoneNumber)) {
        alert('Este número já está cadastrado!');
        return;
    }

    // Adiciona novo número
    const newEntry = {
        phoneNumber,
        operator,
        type: "WhatsApp",
        message,
        status: "Ativo",
        dateAdded: new Date().toISOString()
    };
    
    activeNumbers.push(newEntry);
    localStorage.setItem('activeNumbers', JSON.stringify(activeNumbers));
    addNumberToTable(phoneNumber, operator, "WhatsApp", message, "Ativo");
    
    event.target.reset();
});

// Função para adicionar número à tabela
function addNumberToTable(phoneNumber, operator, type, message, status) {
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${phoneNumber}</td>
        <td>${operator}</td>
        <td>${type}</td>
        <td><a href="https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}" target="_blank">Link Original</a></td>
        <td class="status">${status}</td>
        <td>
            <button onclick="toggleStatus(this)" class="btn-toggle">
                ${status === 'Ativo' ? 'Desativar' : 'Ativar'}
            </button>
            <button onclick="removeNumber(this)" class="btn-delete">Excluir</button>
        </td>
    `;
    document.getElementById('numbersContainer').appendChild(newRow);
}

// Função para excluir número
function removeNumber(button) {
    const row = button.parentNode.parentNode;
    const phoneNumberCell = row.cells[0];
    activeNumbers = activeNumbers.filter(item => item.phoneNumber !== phoneNumberCell.textContent);
    localStorage.setItem('activeNumbers', JSON.stringify(activeNumbers));
    row.remove();
}

// Função para alternar status
function toggleStatus(button) {
    const row = button.closest('tr');
    const phoneNumber = row.cells[0].textContent;
    const statusCell = row.querySelector('.status');
    const newStatus = statusCell.textContent === 'Ativo' ? 'Inativo' : 'Ativo';
    
    statusCell.textContent = newStatus;
    button.textContent = newStatus === 'Ativo' ? 'Desativar' : 'Ativar';
    
    activeNumbers = activeNumbers.map(item => {
        if (item.phoneNumber === phoneNumber) {
            return { ...item, status: newStatus };
        }
        return item;
    });
    
    localStorage.setItem('activeNumbers', JSON.stringify(activeNumbers));
}

// Funções de compartilhamento
function generateShareableLink() {
    const activeEntries = activeNumbers.filter(item => item.status === 'Ativo');
    const encodedData = btoa(JSON.stringify(activeEntries));
    const baseUrl = window.location.origin;
    return `${baseUrl}/redirect.html?data=${encodedData}`;
}

function addShareButton() {
    const container = document.querySelector('.redirect-button');
    const shareButton = document.createElement('button');
    shareButton.className = 'btn-primary';
    shareButton.style.marginLeft = '10px';
    shareButton.textContent = 'Copiar Link Compartilhável';
    shareButton.onclick = async () => {
        const link = generateShareableLink();
        await navigator.clipboard.writeText(link);
        alert('Link copiado para a área de transferência!');
    };
    container.appendChild(shareButton);
}

// Inicialização
window.onload = function() {
    activeNumbers.forEach(item => {
        addNumberToTable(item.phoneNumber, item.operator, item.type, item.message, item.status);
    });
    addShareButton();
    
    // Configuração do fallback URL
    const fallbackUrlInput = document.getElementById('fallbackUrl');
    fallbackUrlInput.value = localStorage.getItem('fallbackUrl') || '';
    
    fallbackUrlInput.addEventListener('input', function() {
        let url = this.value.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://') && url.length > 0) {
            url = 'http://' + url;
        }
        localStorage.setItem('fallbackUrl', url);
    });
};
