document.addEventListener('DOMContentLoaded', function() {
    // Elementos do formulário
    const tipoMovimento = document.getElementById('tipo_movimento');
    const notaFiscalDiv = document.getElementById('nota_fiscal').parentElement;
    const fornecedorDiv = document.getElementById('fornecedor').parentElement;
    const motivoSaidaDiv = document.getElementById('motivo_saida').parentElement;
    const tableBody = document.querySelector('tbody');
    const addButton = document.querySelector('tfoot button');
    const totalInput = document.querySelector('input[name="total"]');
    const form = document.querySelector('form');

    // Inicialização
    initializeForm();
    updateFieldVisibility();
    calculateAllSubtotals();

    // Event Listeners
    tipoMovimento.addEventListener('change', updateFieldVisibility);
    addButton.addEventListener('click', addNewRow);
    form.addEventListener('submit', validateForm);

    // Para cada linha existente, adiciona os event listeners
    attachRowEventListeners();

    // Funções
    function initializeForm() {
        // Define a data e hora atual
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        
        document.getElementById('data_movimento').value = `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    function updateFieldVisibility() {
        const tipo = tipoMovimento.value;
        
        // Mostra/oculta campos de acordo com o tipo de movimento
        if (tipo === 'entrada') {
            notaFiscalDiv.style.display = 'block';
            fornecedorDiv.style.display = 'block';
            motivoSaidaDiv.style.display = 'none';
        } else if (tipo === 'saida') {
            notaFiscalDiv.style.display = 'none';
            fornecedorDiv.style.display = 'none';
            motivoSaidaDiv.style.display = 'block';
        } else {
            notaFiscalDiv.style.display = 'none';
            fornecedorDiv.style.display = 'none';
            motivoSaidaDiv.style.display = 'none';
        }
    }

    function attachRowEventListeners() {
        const rows = tableBody.querySelectorAll('tr');
        
        rows.forEach((row, index) => {
            // Adiciona index+1 para corresponder aos nomes dos campos
            const rowIndex = index + 1;
            
            // Event listeners para calcular o subtotal
            const quantidadeInput = row.querySelector(`input[name="quantidade_${rowIndex}"]`);
            const valorUnitarioInput = row.querySelector(`input[name="valor_unitario_${rowIndex}"]`);
            const subtotalInput = row.querySelector(`input[name="subtotal_${rowIndex}"]`);
            
            // Eventos para recalcular o subtotal quando quantidade ou valor mudar
            if (quantidadeInput && valorUnitarioInput) {
                quantidadeInput.addEventListener('input', () => calculateSubtotal(rowIndex));
                valorUnitarioInput.addEventListener('input', () => calculateSubtotal(rowIndex));
            }
            
            // Evento para remover linha
            const removeButton = row.querySelector('button');
            if (removeButton) {
                removeButton.addEventListener('click', () => removeRow(row));
            }
        });
    }

    function calculateSubtotal(rowIndex) {
        const quantidade = parseFloat(document.querySelector(`input[name="quantidade_${rowIndex}"]`).value) || 0;
        const valorUnitario = parseFloat(document.querySelector(`input[name="valor_unitario_${rowIndex}"]`).value) || 0;
        const subtotal = quantidade * valorUnitario;
        
        document.querySelector(`input[name="subtotal_${rowIndex}"]`).value = subtotal.toFixed(2);
        
        calculateTotal();
    }

    function calculateAllSubtotals() {
        const rows = tableBody.querySelectorAll('tr');
        
        rows.forEach((row, index) => {
            calculateSubtotal(index + 1);
        });
        
        calculateTotal();
    }

    function calculateTotal() {
        let total = 0;
        const subtotalInputs = document.querySelectorAll('input[name^="subtotal_"]');
        
        subtotalInputs.forEach(input => {
            total += parseFloat(input.value) || 0;
        });
        
        totalInput.value = total.toFixed(2);
    }

    function addNewRow() {
        const rowCount = tableBody.querySelectorAll('tr').length;
        const newIndex = rowCount + 1;
        
        const newRow = document.createElement('tr');
        
        // Cria a estrutura HTML da nova linha
        newRow.innerHTML = `
            <td>
                <select name="produto_${newIndex}" required>
                    <option value="">Selecione um produto</option>
                    <option value="1">Paracetamol 500mg</option>
                    <option value="2">Dipirona 500mg</option>
                    <option value="3">Amoxicilina 500mg</option>
                    <option value="4">Omeprazol 20mg</option>
                    <option value="5">Losartana 50mg</option>
                </select>
            </td>
            <td><input type="text" name="lote_${newIndex}" size="10" required></td>
            <td><input type="date" name="validade_${newIndex}" required></td>
            <td><input type="number" name="quantidade_${newIndex}" min="1" required></td>
            <td>
                <select name="unidade_${newIndex}" required>
                    <option value="cx">Caixa</option>
                    <option value="un">Unidade</option>
                    <option value="amp">Ampola</option>
                    <option value="fr">Frasco</option>
                </select>
            </td>
            <td><input type="number" name="valor_unitario_${newIndex}" min="0" step="0.01" required></td>
            <td><input type="number" name="subtotal_${newIndex}" min="0" step="0.01" readonly></td>
            <td><button type="button">Remover</button></td>
        `;
        
        tableBody.appendChild(newRow);
        
        // Adiciona event listeners para a nova linha
        const quantidadeInput = newRow.querySelector(`input[name="quantidade_${newIndex}"]`);
        const valorUnitarioInput = newRow.querySelector(`input[name="valor_unitario_${newIndex}"]`);
        
        quantidadeInput.addEventListener('input', () => calculateSubtotal(newIndex));
        valorUnitarioInput.addEventListener('input', () => calculateSubtotal(newIndex));
        
        const removeButton = newRow.querySelector('button');
        removeButton.addEventListener('click', () => removeRow(newRow));
    }

    function removeRow(row) {
        // Não permitir remover se for a única linha
        if (tableBody.querySelectorAll('tr').length <= 1) {
            alert('Não é possível remover todos os itens. Pelo menos um item deve permanecer.');
            return;
        }
        
        tableBody.removeChild(row);
        
        // Reindexar os campos para manter a sequência correta
        reindexRows();
        
        // Recalcular o total
        calculateTotal();
    }

    function reindexRows() {
        const rows = tableBody.querySelectorAll('tr');
        
        rows.forEach((row, index) => {
            const newIndex = index + 1;
            const oldIndex = getRowIndex(row);
            
            if (oldIndex !== newIndex) {
                // Atualiza os nomes dos campos para o novo índice
                updateFieldName(row, 'produto_', oldIndex, newIndex);
                updateFieldName(row, 'lote_', oldIndex, newIndex);
                updateFieldName(row, 'validade_', oldIndex, newIndex);
                updateFieldName(row, 'quantidade_', oldIndex, newIndex);
                updateFieldName(row, 'unidade_', oldIndex, newIndex);
                updateFieldName(row, 'valor_unitario_', oldIndex, newIndex);
                updateFieldName(row, 'subtotal_', oldIndex, newIndex);
                
                // Atualiza os event listeners
                const quantidadeInput = row.querySelector(`input[name="quantidade_${newIndex}"]`);
                const valorUnitarioInput = row.querySelector(`input[name="valor_unitario_${newIndex}"]`);
                
                if (quantidadeInput && valorUnitarioInput) {
                    quantidadeInput.addEventListener('input', () => calculateSubtotal(newIndex));
                    valorUnitarioInput.addEventListener('input', () => calculateSubtotal(newIndex));
                }
            }
        });
    }

    function getRowIndex(row) {
        // Obtém o índice atual da linha a partir do nome do primeiro input
        const firstInput = row.querySelector('select[name^="produto_"]');
        if (firstInput) {
            const name = firstInput.getAttribute('name');
            return parseInt(name.split('_')[1]);
        }
        return -1;
    }

    function updateFieldName(row, prefix, oldIndex, newIndex) {
        const element = row.querySelector(`[name="${prefix}${oldIndex}"]`);
        if (element) {
            element.setAttribute('name', `${prefix}${newIndex}`);
        }
    }

    function validateForm(event) {
        // Previne o envio do formulário para demonstração
        event.preventDefault();
        
        // Validação básica
        const tipo = tipoMovimento.value;
        if (!tipo) {
            alert('Por favor, selecione o tipo de movimento.');
            return;
        }
        
        // Validação de campos específicos por tipo de movimento
        if (tipo === 'entrada') {
            const notaFiscal = document.getElementById('nota_fiscal').value;
            const fornecedor = document.getElementById('fornecedor').value;
            
            if (!notaFiscal) {
                alert('Por favor, informe o número da nota fiscal.');
                return;
            }
            
            if (!fornecedor) {
                alert('Por favor, selecione o fornecedor.');
                return;
            }
        } else if (tipo === 'saida') {
            const motivoSaida = document.getElementById('motivo_saida').value;
            
            if (!motivoSaida) {
                alert('Por favor, selecione o motivo da saída.');
                return;
            }
        }
        
        // Validação dos itens
        const rows = tableBody.querySelectorAll('tr');
        let valid = true;
        
        rows.forEach((row, index) => {
            const rowIndex = index + 1;
            const produto = row.querySelector(`select[name="produto_${rowIndex}"]`).value;
            const lote = row.querySelector(`input[name="lote_${rowIndex}"]`).value;
            const validade = row.querySelector(`input[name="validade_${rowIndex}"]`).value;
            const quantidade = row.querySelector(`input[name="quantidade_${rowIndex}"]`).value;
            
            if (!produto || !lote || !validade || !quantidade) {
                valid = false;
            }
        });
        
        if (!valid) {
            alert('Por favor, preencha todos os campos obrigatórios dos itens.');
            return;
        }
        
        // Se chegou até aqui, o formulário é válido
        alert('Movimento registrado com sucesso! (Simulação)');
        
        // Em um ambiente real, aqui enviaria o formulário para o servidor
        // form.submit();
    }
});

/*
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!ERRADO!!!!!!!!!!!!!!!!!!!!!!!! ARRUMAR!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/