function formatPhoneNumber(phone) {
    let cleaned = phone.replace(/\D/g, '');
    if (!cleaned.startsWith('55')) {
        cleaned = '55' + cleaned;
    }
    return cleaned;
}

let activeNumbers = JSON.parse(localStorage.getItem('activeNumbers')) || [];

document.getElementById('whatsappForm').addEventListener('submit', function(event) {
    event.preventDefault();

    let phoneNumber = document.getElementById('phoneNumber').value.trim();
    const operator = document.getElementById('operator').value.trim();
    const message = document.getElementById('message').value.trim() || "oii vi seu anuncio";

    phoneNumber = formatPhoneNumber(phoneNumber);
    if (phoneNumber.length < 12) {
        alert('Número de telefone inválido!');
        return;
    }

    if (activeNumbers.some(item => item.phoneNumber === phoneNumber)) {
        alert('Este número já está cadastrado!');
        return;
    }

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

function addNumberToTable(phoneNumber, operator, type, message, status) {
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${phoneNumber}</td>
        <td>${operator}</td>
        <td>${type}</td>
        <td><a href="https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}" target="_blank">Link Original</a></td>
        <td class="status">${status}</td>
        <td>
            <button onclick="toggleStatus(this)" class="btn-toggle">${status === 'Ativo' ? 'Desativar' : 'Ativar'}</button>
            <button onclick="removeNumber(this)" class="btn-delete">Excluir</button>
        </td>
    `;
    document.getElementById('numbersContainer').appendChild(newRow);
}

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

function removeNumber(button) {
    const row = button.closest('tr');
    const phoneNumber = row.cells[0].textContent;
    activeNumbers = activeNumbers.filter(item => item.phoneNumber !== phoneNumber);
    localStorage.setItem('activeNumbers', JSON.stringify(activeNumbers));
    row.remove();
}
