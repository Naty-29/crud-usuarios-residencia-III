
const API_BASE = "http://127.0.0.1:8000";
const PAGE_SIZE = 8;

/* Estado */
let usuarios = [];       // lista completa vinda da API
let paginaAtual = 1;
let editandoId = null;   // null = criando novo usuário

/* Referências DOM */
const tbody = document.getElementById('tbody-usuarios');
const emptyState = document.getElementById('empty-state');
const pageInfo = document.getElementById('page-info');
const pageBtns = document.getElementById('page-btns');
const form = document.getElementById('form-usuario');
const formTitle = document.getElementById('form-title');
const formSubtitle = document.getElementById('form-subtitle');
const fieldId = document.getElementById('field-id');
const inputId = document.getElementById('input-id');
const inputNome = document.getElementById('input-nome');
const inputEmail = document.getElementById('input-email');
const inputCpf = document.getElementById('input-cpf');
const inputTelefone = document.getElementById('input-telefone');
const inputNascimento = document.getElementById('input-nascimento');
const toast = document.getElementById('toast');

/* Toast de feedback */
let toastTimer = null;
function mostrarToast(mensagem, tipo = 'default') {
  clearTimeout(toastTimer);
  toast.textContent = mensagem;
  toast.className = 'toast show ' + (tipo === 'default' ? '' : tipo);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

/* 
   Comunicação com a API
   A tabela `usuarios` é retornada como array de arrays
   (SELECT * sem cursor de dicionário), na ordem das colunas:
   [idUsuarios, nome, email, cpf, telefone, data_nascimento,
    data_cadastro, ativo]
   Ajuste os índices abaixo se a ordem das colunas no banco mudar.
 */
const COL = { id: 0, nome: 1, email: 2, cpf: 3, telefone: 4, nascimento: 5, cadastro: 6, ativo: 7 };

async function carregarUsuarios() {
  try {
    const resp = await fetch(`${API_BASE}/usuarios`);
    if (!resp.ok) throw new Error('Falha ao carregar usuários');
    usuarios = await resp.json();
    renderizarTabela();
  } catch (erro) {
    mostrarToast('Não foi possível carregar os usuários. A API está rodando?', 'danger');
    console.error(erro);
  }
}

async function salvarUsuario(payload, id) {
  const url = id ? `${API_BASE}/usuarios/${id}` : `${API_BASE}/usuarios`;
  const metodo = id ? 'PUT' : 'POST';

  const resp = await fetch(url, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const dados = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    throw new Error(dados.detail || 'Erro ao salvar usuário.');
  }
  return dados;
}

async function excluirUsuario(id) {
  const resp = await fetch(`${API_BASE}/usuarios/${id}`, { method: 'DELETE' });
  const dados = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(dados.detail || 'Erro ao excluir usuário.');
  }
  return dados;
}

/* Renderização da tabela */
function iniciaisDoNome(nome) {
  const partes = nome.trim().split(' ').filter(Boolean);
  const primeiras = partes.slice(0, 2).map(p => p[0]);
  return primeiras.join('').toUpperCase();
}

function formatarData(valor) {
  if (!valor) return '—';
  const data = new Date(valor);
  if (isNaN(data)) return valor;
  return data.toLocaleDateString('pt-BR');
}

function renderizarTabela() {
  const inicio = (paginaAtual - 1) * PAGE_SIZE;
  const paginaUsuarios = usuarios.slice(inicio, inicio + PAGE_SIZE);

  tbody.innerHTML = '';
  emptyState.style.display = usuarios.length === 0 ? 'block' : 'none';

  paginaUsuarios.forEach(u => {
    const id = u[COL.id];
    const nome = u[COL.nome];
    const ativo = Number(u[COL.ativo]) === 1;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${id}</td>
      <td>
        <div class="user-cell">
          <div class="avatar">${iniciaisDoNome(nome)}</div>
          <span>${nome}</span>
        </div>
      </td>
      <td>${u[COL.cpf] ?? '—'}</td>
      <td>${u[COL.email]}</td>
      <td>${u[COL.telefone] ?? '—'}</td>
      <td>${formatarData(u[COL.nascimento])}</td>
      <td><span class="status-pill ${ativo ? 'active' : 'inactive'}">${ativo ? 'Ativo' : 'Inativo'}</span></td>
      <td>
        <div class="row-actions">
          <button class="icon-btn" title="Editar" data-acao="editar" data-id="${id}">✎</button>
          <button class="icon-btn danger" title="Excluir" data-acao="excluir" data-id="${id}">🗑</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  renderizarPaginacao();
}

function renderizarPaginacao() {
  const totalPaginas = Math.max(1, Math.ceil(usuarios.length / PAGE_SIZE));
  const inicio = usuarios.length === 0 ? 0 : (paginaAtual - 1) * PAGE_SIZE + 1;
  const fim = Math.min(paginaAtual * PAGE_SIZE, usuarios.length);

  pageInfo.textContent = `${inicio} a ${fim} de ${usuarios.length}`;

  pageBtns.innerHTML = '';
  for (let p = 1; p <= totalPaginas; p++) {
    const btn = document.createElement('button');
    btn.className = 'page-btn' + (p === paginaAtual ? ' active' : '');
    btn.textContent = p;
    btn.addEventListener('click', () => {
      paginaAtual = p;
      renderizarTabela();
    });
    pageBtns.appendChild(btn);
  }
}

/* Formulário: abrir / limpar / preencher */
function limparErros() {
  document.querySelectorAll('.field').forEach(f => f.classList.remove('has-error'));
}

function abrirFormularioNovo() {
  editandoId = null;
  form.reset();
  limparErros();
  fieldId.style.display = 'none';
  formTitle.textContent = 'Cadastro de usuário';
  formSubtitle.textContent = 'Preencha os dados abaixo';
  document.getElementById('btn-salvar').textContent = 'Salvar';
}

function abrirFormularioEdicao(id) {
  const u = usuarios.find(u => String(u[COL.id]) === String(id));
  if (!u) return;

  editandoId = id;
  limparErros();
  fieldId.style.display = 'block';
  inputId.value = u[COL.id];
  inputNome.value = u[COL.nome];
  inputEmail.value = u[COL.email];
  inputCpf.value = u[COL.cpf] ?? '';
  inputTelefone.value = u[COL.telefone] ?? '';
  inputNascimento.value = (u[COL.nascimento] || '').substring(0, 10);

  formTitle.textContent = 'Editar usuário';
  formSubtitle.textContent = `Editando #${u[COL.id]}`;
  document.getElementById('btn-salvar').textContent = 'Salvar alterações';
}

/* Validação simples do formulário */
function validarFormulario() {
  limparErros();
  let valido = true;

  if (!inputNome.value.trim()) {
    document.getElementById('field-nome').classList.add('has-error');
    valido = false;
  }
  if (!inputEmail.value.trim() || !inputEmail.value.includes('@')) {
    document.getElementById('field-email').classList.add('has-error');
    valido = false;
  }
  if (!inputCpf.value.trim()) {
    document.getElementById('field-cpf').classList.add('has-error');
    valido = false;
  }
  if (!inputNascimento.value) {
    document.getElementById('field-nascimento').classList.add('has-error');
    valido = false;
  }

  return valido;
}

/* Eventos */

document.getElementById('btn-novo').addEventListener('click', abrirFormularioNovo);
document.getElementById('btn-cancelar').addEventListener('click', abrirFormularioNovo);

tbody.addEventListener('click', async (ev) => {
  const btn = ev.target.closest('button[data-acao]');
  if (!btn) return;

  const id = btn.dataset.id;
  const acao = btn.dataset.acao;

  if (acao === 'editar') {
    abrirFormularioEdicao(id);
  }

  if (acao === 'excluir') {
    const confirmar = confirm('Tem certeza que deseja excluir este usuário?');
    if (!confirmar) return;

    try {
      await excluirUsuario(id);
      mostrarToast('Usuário excluído com sucesso.', 'success');
      if (editandoId === id) abrirFormularioNovo();
      await carregarUsuarios();
    } catch (erro) {
      mostrarToast(erro.message, 'danger');
    }
  }
});

form.addEventListener('submit', async (ev) => {
  ev.preventDefault();

  if (!validarFormulario()) return;

  const payload = {
    nome: inputNome.value.trim(),
    email: inputEmail.value.trim(),
    cpf: inputCpf.value.trim(),
    telefone: inputTelefone.value.trim() || null,
    data_nascimento: inputNascimento.value
  };

  const btnSalvar = document.getElementById('btn-salvar');
  btnSalvar.disabled = true;

  try {
    await salvarUsuario(payload, editandoId);
    mostrarToast(editandoId ? 'Usuário atualizado com sucesso.' : 'Usuário cadastrado com sucesso.', 'success');
    abrirFormularioNovo();
    await carregarUsuarios();
  } catch (erro) {
    mostrarToast(erro.message, 'danger');
  } finally {
    btnSalvar.disabled = false;
  }
});


carregarUsuarios();