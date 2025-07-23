import { db } from './firebase.js';
import {
  collection, doc, setDoc, getDoc, addDoc, getDocs, onSnapshot, query, serverTimestamp, updateDoc, deleteDoc
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const mainContent = document.getElementById('main-content');

function renderHome() {
  mainContent.innerHTML = `
    <div class="flex flex-col items-center justify-start min-h-[60vh] pt-6">
      <h1 class="text-4xl sm:text-5xl font-extrabold mb-8 text-blue-700 drop-shadow-lg tracking-wide">Money Splitter</h1>
      <div class="flex flex-col gap-4 w-full max-w-xs">
        <button id="start-session" class="bg-gradient-to-r from-blue-500 to-blue-700 text-white text-lg font-semibold px-6 py-4 rounded-xl shadow-lg hover:scale-105 transition mb-2">Start a Splitting Session</button>
        <button id="join-session" class="bg-gradient-to-r from-green-500 to-green-700 text-white text-lg font-semibold px-6 py-4 rounded-xl shadow-lg hover:scale-105 transition">Join Existing Session</button>
      </div>
    </div>
  `;

  document.getElementById('start-session').onclick = showCreateSessionForm;
  document.getElementById('join-session').onclick = showJoinSessionForm;
}

function showCreateSessionForm() {
  mainContent.innerHTML = `
    <div class="flex flex-col items-center justify-center min-h-[60vh] pt-6">
      <div class="bg-gradient-to-br from-blue-50 via-green-50 to-white rounded-2xl shadow-xl p-8 w-full max-w-md animate-fade-in">
        <h2 class="text-3xl font-extrabold mb-8 text-blue-700 drop-shadow-lg tracking-wide text-center">Start a Splitting Session</h2>
        <input id="host-name" class="border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-3 rounded-xl w-full text-lg mb-6 transition placeholder-gray-400" placeholder="Your Name" />
        <button id="create-session-btn" class="bg-gradient-to-r from-blue-500 to-blue-700 text-white text-lg font-semibold px-8 py-3 rounded-xl shadow-lg hover:scale-105 hover:from-green-500 hover:to-green-700 transition w-full mb-4">Create</button>
        <div id="create-session-error" class="text-red-500 mb-2"></div>
        <button id="back-home-btn" class="w-full mt-2 text-blue-600 underline font-semibold hover:text-blue-800 transition">Back</button>
      </div>
    </div>
  `;
  document.getElementById('create-session-btn').onclick = async () => {
    const hostName = document.getElementById('host-name').value.trim();
    if (!hostName) {
      document.getElementById('create-session-error').textContent = "Please enter your name.";
      return;
    }
    const sessionId = generateSessionCode();
    await setDoc(doc(db, "sessions", sessionId), {
      sessionId,
      hostName,
      createdAt: serverTimestamp()
    });
    await setDoc(doc(db, `sessions/${sessionId}/users`, hostName), {
      name: hostName,
      role: "host"
    });
    renderMemberSetup(sessionId, hostName, true);
  };
  document.getElementById('back-home-btn').onclick = renderHome;
}

function showJoinSessionForm() {
  mainContent.innerHTML = `
    <div class="flex flex-col items-center justify-center min-h-[60vh] pt-6">
      <div class="bg-gradient-to-br from-green-50 via-blue-50 to-white rounded-2xl shadow-xl p-8 w-full max-w-md animate-fade-in">
        <h2 class="text-3xl font-extrabold mb-8 text-green-700 drop-shadow-lg tracking-wide text-center">Join Existing Session</h2>
        <input id="session-code" class="border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 p-3 rounded-xl w-full text-lg mb-6 transition placeholder-gray-400 uppercase" placeholder="Session Code" maxlength="6" />
        <button id="join-session-btn" class="bg-gradient-to-r from-green-500 to-green-700 text-white text-lg font-semibold px-8 py-3 rounded-xl shadow-lg hover:scale-105 hover:from-blue-500 hover:to-blue-700 transition w-full mb-4">Join</button>
        <div id="join-session-error" class="text-red-500 mb-2"></div>
        <button id="back-home-btn" class="w-full mt-2 text-green-600 underline font-semibold hover:text-green-800 transition">Back</button>
      </div>
    </div>
  `;
  document.getElementById('join-session-btn').onclick = async () => {
    const sessionId = document.getElementById('session-code').value.trim().toUpperCase();
    const sessionRef = doc(db, "sessions", sessionId);
    const sessionSnap = await getDoc(sessionRef);
    if (!sessionSnap.exists()) {
      document.getElementById('join-session-error').textContent = "Session not found.";
      return;
    }
    renderMemberSetup(sessionId, null, false);
  };
  document.getElementById('back-home-btn').onclick = renderHome;
}

function generateSessionCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

let currentSessionId = null;
let currentUserName = null;
let isHost = false;
let memberNames = [];

function renderMemberSetup(sessionId, userName, host) {
  currentSessionId = sessionId;
  isHost = host;
  mainContent.innerHTML = '';
  if (host) {
    // Host: Add all member names (including self)
    mainContent.innerHTML = `
      <div class="flex flex-col items-center justify-center min-h-[60vh] pt-6">
        <h2 class="text-3xl font-extrabold mb-6 text-blue-700 drop-shadow-lg tracking-wide">Add All Members</h2>
        <div id="members-list" class="mb-4 flex flex-wrap gap-2 justify-center"></div>
        <div class="flex flex-col sm:flex-row gap-2 w-full max-w-xs mb-4">
          <input id="member-name-input" class="border p-3 rounded-lg flex-1 text-lg" placeholder="Member Name" />
        </div>
        <div class="flex flex-col sm:flex-row gap-4 w-full max-w-xs justify-center">
          <button id="add-member-btn" class="bg-gradient-to-r from-blue-500 to-blue-700 text-white text-lg font-semibold px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition">Add</button>
          <button id="finish-members-btn" class="bg-gradient-to-r from-green-500 to-green-700 text-white text-lg font-semibold px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition">Finish</button>
        </div>
        <div id="member-error" class="text-red-500 mt-4"></div>
      </div>
    `;
    memberNames = [userName];
    updateMembersList();

    document.getElementById('add-member-btn').onclick = async () => {
      const name = document.getElementById('member-name-input').value.trim();
      if (!name || memberNames.includes(name)) {
        document.getElementById('member-error').textContent = "Enter a unique member name.";
        return;
      }
      memberNames.push(name);
      await setDoc(doc(db, `sessions/${sessionId}/users`, name), {
        name,
        role: "participant"
      });
      updateMembersList();
      document.getElementById('member-name-input').value = '';
      document.getElementById('member-error').textContent = '';
    };

    document.getElementById('finish-members-btn').onclick = () => {
      renderSession(sessionId, userName, true);
    };

    function updateMembersList() {
      document.getElementById('members-list').innerHTML =
        memberNames.map(n => `<span class="inline-block bg-blue-100 text-blue-700 font-semibold px-3 py-1 rounded-full shadow">${n}</span>`).join('');
    }
  } else {
    // Participant: Enter their name
    mainContent.innerHTML = `
      <div class="flex flex-col items-center justify-center min-h-[60vh] pt-6">
        <h2 class="text-2xl font-extrabold mb-6 text-green-700 drop-shadow-lg tracking-wide">Enter Your Name</h2>
        <input id="participant-name-input" class="border p-3 rounded-lg mb-4 w-full max-w-xs text-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition" placeholder="Your Name" />
        <button id="join-member-btn" class="bg-gradient-to-r from-green-500 to-green-700 text-white text-lg font-semibold px-6 py-3 rounded-xl shadow-lg hover:scale-105 hover:from-blue-500 hover:to-blue-700 transition w-full max-w-xs">Join</button>
        <div id="participant-error" class="text-red-500 mt-4"></div>
      </div>
    `;
    document.getElementById('join-member-btn').onclick = async () => {
      const name = document.getElementById('participant-name-input').value.trim();
      if (!name) {
        document.getElementById('participant-error').textContent = "Please enter your name.";
        return;
      }
      // Check if name exists in users subcollection
      const userDoc = await getDoc(doc(db, `sessions/${sessionId}/users`, name));
      if (!userDoc.exists()) {
        document.getElementById('participant-error').textContent = "Name not found in this session.";
        return;
      }
      renderSession(sessionId, name, false);
    };
  }
}

function renderSession(sessionId, userName, host) {
  currentSessionId = sessionId;
  currentUserName = userName;
  isHost = host;
  mainContent.innerHTML = `
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 shadow">
      <div>
        <span class="font-semibold text-gray-700">Session:</span>
        <span class="font-mono text-blue-700 text-lg">${sessionId}</span>
        <span class="ml-4 font-semibold text-gray-700">You:</span>
        <span class="text-green-700 font-bold">${userName} ${host ? '<span class="bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full ml-1 text-xs align-middle">Host</span>' : ''}</span>
      </div>
      <button id="leave-session-btn" class="bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 px-5 py-2 rounded-xl shadow hover:from-red-400 hover:to-red-600 hover:text-white transition font-semibold text-base">Leave</button>
    </div>
    <div id="members-summary" class="mb-6"></div>
    <div id="transactions-section"></div>
    <div id="balances-section" class="mt-8"></div>
  `;

  document.getElementById('leave-session-btn').onclick = () => {
    location.reload();
  };

  // Fetch members
  const usersCol = collection(db, `sessions/${sessionId}/users`);
  onSnapshot(usersCol, (snapshot) => {
    memberNames = snapshot.docs.map(doc => doc.data().name);
    // Remove the old members list rendering here
    // document.getElementById('members-summary').innerHTML =
    //   `<span class="font-semibold text-gray-700">Members:</span> 
    //   <span class="flex flex-wrap gap-2 mt-2">
    //     ${memberNames.map(n => `<span class="inline-block bg-gradient-to-r from-blue-200 to-green-200 text-blue-900 font-semibold px-3 py-1 rounded-full shadow">${n}</span>`).join('')}
    //   </span>`;
    renderTransactionsSection();
  });
}

let editingTxnId = null; // Track if editing a transaction

function renderTransactionsSection() {
  const section = document.getElementById('transactions-section');
  section.innerHTML = `
    <div class="flex flex-col gap-2 mb-4">
      <div class="flex items-center flex-wrap gap-2 mb-2">
        <span class="font-semibold text-gray-700">Members:</span>
        ${memberNames.map(n => `<span class="inline-block bg-gradient-to-r from-blue-200 to-green-200 text-blue-900 font-semibold px-3 py-1 rounded-full shadow">${n}</span>`).join('')}
        <button id="add-member-circular-btn" class="ml-2 flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-blue-500 text-white text-2xl font-bold shadow-lg hover:scale-110 hover:from-blue-500 hover:to-green-600 transition" title="Add Member">+</button>
      </div>
      <div id="add-member-inline-form" class="mb-2"></div>
      <div class="flex flex-col sm:flex-row gap-2">
        <button id="add-transaction-btn" class="bg-gradient-to-r from-blue-500 to-blue-700 text-white text-lg font-semibold px-6 py-3 rounded-xl shadow-lg hover:scale-105 hover:from-green-500 hover:to-green-700 transition w-full sm:w-auto">Add Transaction</button>
      </div>
    </div>
    <div id="add-transaction-form" class="mb-4"></div>
    <div id="transactions-table" class="overflow-x-auto"></div>
  `;
  document.getElementById('add-transaction-btn').onclick = () => showAddTransactionForm();

  // Add member circular button logic
  document.getElementById('add-member-circular-btn').onclick = () => {
    const formDiv = document.getElementById('add-member-inline-form');
    if (formDiv.innerHTML.trim() !== '') return; // Prevent multiple forms
    formDiv.innerHTML = `
      <div class="flex items-center gap-2 mt-2">
        <input id="inline-member-name" class="border p-2 rounded text-base" placeholder="Member Name" />
        <button id="inline-add-member-btn" class="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full w-9 h-9 flex items-center justify-center text-xl font-bold shadow hover:scale-110 transition">+</button>
        <button id="inline-cancel-member-btn" class="text-gray-500 hover:text-red-500 text-lg font-bold">×</button>
        <span id="inline-member-error" class="text-red-500 ml-2"></span>
      </div>
    `;
    document.getElementById('inline-add-member-btn').onclick = async () => {
      const name = document.getElementById('inline-member-name').value.trim();
      if (!name || memberNames.includes(name)) {
        document.getElementById('inline-member-error').textContent = "Enter a unique member name.";
        return;
      }
      await setDoc(doc(db, `sessions/${currentSessionId}/users`, name), {
        name,
        role: "participant"
      });
      formDiv.innerHTML = '';
    };
    document.getElementById('inline-cancel-member-btn').onclick = () => {
      formDiv.innerHTML = '';
    };
  };

  listenAndRenderTransactions();
}

function showAddTransactionForm(txn = null) {
  const form = document.getElementById('add-transaction-form');
  editingTxnId = txn ? txn.id : null;
  form.innerHTML = `
    <div class="bg-gradient-to-br from-blue-50 via-green-50 to-white rounded-2xl shadow-xl p-6 mb-4 animate-fade-in">
      <div class="flex flex-col sm:flex-row gap-4 mb-4">
        <input id="txn-desc" class="border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-3 rounded-xl flex-1 text-lg transition placeholder-gray-400" placeholder="Description" value="${txn ? txn.description : ''}" />
        <input id="txn-amount" type="number" min="0.01" step="0.01" class="border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 p-3 rounded-xl flex-1 text-lg transition placeholder-gray-400" placeholder="Amount" value="${txn ? txn.amount : ''}" />
      </div>
      <div class="flex flex-col sm:flex-row gap-4 mb-4">
        <div class="flex items-center flex-1">
          <label class="mr-3 font-semibold text-blue-700 whitespace-nowrap">Paid By:</label>
          <select id="txn-payer" class="border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-2 rounded-xl w-auto min-w-[120px] max-w-[180px] text-base font-semibold bg-white transition">
            ${memberNames.map(n => `<option value="${n}" ${txn && txn.payer === n ? 'selected' : ''}>${n}</option>`).join('')}
          </select>
        </div>
        <div class="flex-1">
          <label class="mr-3 font-semibold text-green-700">Split Among:</label>
          <div id="txn-members-checkboxes" class="flex flex-wrap gap-2 mt-2">
            ${memberNames.map(n => `
              <label class="inline-flex items-center bg-gradient-to-r from-blue-100 to-green-100 px-3 py-1 rounded-full shadow hover:scale-105 transition cursor-pointer">
                <input type="checkbox" class="txn-member-checkbox mr-2 accent-blue-600" value="${n}" ${txn && txn.members.includes(n) ? 'checked' : ''} />
                <span class="font-semibold text-blue-800">${n}</span>
              </label>
            `).join('')}
          </div>
        </div>
      </div>
      <div class="flex gap-2 mt-4">
        <button id="submit-txn-btn" class="bg-gradient-to-r from-green-500 to-green-700 text-white text-lg font-semibold px-8 py-3 rounded-xl shadow-lg hover:scale-105 hover:from-blue-500 hover:to-blue-700 transition flex-1">${txn ? 'Update' : 'Add'}</button>
        <button id="cancel-txn-btn" class="bg-gray-300 text-gray-700 px-5 py-3 rounded-xl hover:bg-gray-400 transition flex-1 font-semibold">Cancel</button>
      </div>
      <div id="txn-error" class="text-red-500 mt-3"></div>
    </div>
  `;
  document.getElementById('cancel-txn-btn').onclick = () => {
    form.innerHTML = '';
    editingTxnId = null;
  };
  document.getElementById('submit-txn-btn').onclick = async () => {
    const desc = document.getElementById('txn-desc').value.trim();
    const amount = parseFloat(document.getElementById('txn-amount').value);
    const payer = document.getElementById('txn-payer').value;
    const members = Array.from(document.querySelectorAll('.txn-member-checkbox:checked')).map(cb => cb.value);
    if (!desc || !amount || !payer || members.length === 0) {
      document.getElementById('txn-error').textContent = "Fill all fields and select at least one member.";
      return;
    }
    if (editingTxnId) {
      // Update existing transaction
      await updateDoc(doc(db, `sessions/${currentSessionId}/transactions`, editingTxnId), {
        amount,
        payer,
        members,
        description: desc
        // Do not update timestamp on edit
      });
    } else {
      // Add new transaction
      await addDoc(collection(db, `sessions/${currentSessionId}/transactions`), {
        amount,
        payer,
        members,
        description: desc,
        timestamp: serverTimestamp()
      });
    }
    form.innerHTML = '';
    editingTxnId = null;
  };
}

function listenAndRenderTransactions() {
  const txnCol = collection(db, `sessions/${currentSessionId}/transactions`);
  const txnTableDiv = document.getElementById('transactions-table');
  const balancesDiv = document.getElementById('balances-section');
  onSnapshot(txnCol, (snapshot) => {
    const txns = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0));
    txnTableDiv.innerHTML = `
      <div class="rounded-2xl shadow-xl bg-gradient-to-br from-white via-blue-50 to-green-50 p-2 sm:p-4 mb-6 overflow-x-auto" style="min-width: 1000px;">
        <table class="min-w-[950px] w-full bg-white rounded-xl overflow-hidden text-sm sm:text-base">
          <thead>
            <tr class="bg-gradient-to-r from-blue-100 to-green-100">
              <th class="border px-2 py-2">No.</th>
              <th class="border px-2 py-2">Description</th>
              <th class="border px-2 py-2">Amount</th>
              <th class="border px-2 py-2">Paid By</th>
              <th class="border px-2 py-2">Split Between</th>
              <th class="border px-2 py-2">Split Amounts</th>
              <th class="border px-2 py-2">Date & Time</th>
              <th class="border px-2 py-2" style="min-width: 160px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${txns.map((txn, idx) => {
              const perPerson = txn.amount / txn.members.length;
              let dateTime = '';
              if (txn.timestamp && txn.timestamp.seconds) {
                const d = new Date(txn.timestamp.seconds * 1000);
                dateTime = d.toLocaleString();
              }
              return `
                <tr class="hover:bg-blue-50 transition">
                  <td class="border px-2 py-2 text-center font-semibold">${idx + 1}</td>
                  <td class="border px-2 py-2">${txn.description}</td>
                  <td class="border px-2 py-2 text-right">
                    <span class="inline-block bg-green-100 text-green-700 font-bold px-2 py-1 rounded">${txn.amount.toFixed(2)}</span>
                  </td>
                  <td class="border px-2 py-2">
                    <span class="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded">${txn.payer}</span>
                  </td>
                  <td class="border px-2 py-2">${txn.members.map(m => `<span class="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded mr-1 mb-1">${m}</span>`).join('')}</td>
                  <td class="border px-2 py-2">
                    ${txn.members.map(m => `<span class="inline-block bg-gray-200 rounded px-2 py-1 text-xs text-blue-800 font-semibold mr-1 mb-1">${m}: ${perPerson.toFixed(2)}</span>`).join('<br>')}
                  </td>
                  <td class="border px-2 py-2">${dateTime}</td>
                  <td class="border px-2 py-2" style="min-width: 160px;">
                    <button class="edit-txn-btn bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-semibold px-3 py-1 rounded-lg shadow hover:from-yellow-500 hover:to-yellow-600 hover:scale-105 transition mr-1" data-id="${txn.id}">Edit</button>
                    <button class="delete-txn-btn bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold px-3 py-1 rounded-lg shadow hover:from-red-600 hover:to-red-800 hover:scale-105 transition" data-id="${txn.id}">Delete</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    // Add event listeners for edit and delete buttons
    txnTableDiv.querySelectorAll('.edit-txn-btn').forEach(btn => {
      btn.onclick = () => {
        const txn = txns.find(t => t.id === btn.dataset.id);
        showAddTransactionForm(txn);
      };
    });
    txnTableDiv.querySelectorAll('.delete-txn-btn').forEach(btn => {
      btn.onclick = async () => {
        if (confirm('Are you sure you want to delete this transaction?')) {
          await deleteDoc(doc(db, `sessions/${currentSessionId}/transactions`, btn.dataset.id));
        }
      };
    });

    // Calculate balances
    const balances = {};
    memberNames.forEach(n => balances[n] = 0);
    txns.forEach(txn => {
      const share = txn.amount / txn.members.length;
      txn.members.forEach(m => {
        if (m !== txn.payer) balances[m] -= share;
      });
      balances[txn.payer] += txn.amount - share * (txn.members.includes(txn.payer) ? 1 : 0);
    });

    // Calculate minimized transactions (who pays whom)
    const settlements = minimizeTransactions(balances);

    balancesDiv.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="rounded-2xl shadow-lg bg-gradient-to-br from-green-50 via-blue-50 to-white p-4">
          <h3 class="font-bold text-lg mb-3 text-blue-700 flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 1.343-3 3 0 1.657 1.343 3 3 3s3-1.343 3-3c0-1.657-1.343-3-3-3z" /></svg>Balances</h3>
          <ul class="space-y-2">
            ${Object.entries(balances).map(([name, bal]) =>
              `<li class="flex items-center gap-2">
                <span class="font-semibold text-gray-700">${name}:</span>
                <span class="px-3 py-1 rounded-full text-sm font-bold
                  ${bal < 0 ? 'bg-red-100 text-red-600' : bal > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-700'}">
                  ${bal.toFixed(2)}
                </span>
              </li>`
            ).join('')}
          </ul>
        </div>
        <div class="rounded-2xl shadow-lg bg-gradient-to-br from-blue-50 via-green-50 to-white p-4">
          <h3 class="font-bold text-lg mb-3 text-green-700 flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a5 5 0 00-10 0v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2z" /></svg>Settlement</h3>
          <ul class="space-y-2">
            ${settlements.length === 0
              ? '<li class="text-green-600 font-semibold flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>All settled up!</li>'
              : settlements.map(s => `<li class="flex items-center gap-2"><span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-semibold">${s.from}</span> <span class="text-gray-600">will give</span> <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-semibold">${s.amount.toFixed(2)}</span> <span class="text-gray-600">to</span> <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">${s.to}</span></li>`).join('')}
          </ul>
        </div>
      </div>
    `;
  });
}

// Helper function to minimize transactions
function minimizeTransactions(balances) {
  // Convert balances to array of {name, balance}
  const arr = Object.entries(balances).map(([name, balance]) => ({ name, balance: parseFloat(balance.toFixed(2)) }));
  const debtors = arr.filter(x => x.balance < -0.01).sort((a, b) => a.balance - b.balance);
  const creditors = arr.filter(x => x.balance > 0.01).sort((a, b) => b.balance - a.balance);
  const settlements = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(-debtor.balance, creditor.balance);
    if (amount > 0.01) {
      settlements.push({ from: debtor.name, to: creditor.name, amount });
      debtor.balance += amount;
      creditor.balance -= amount;
    }
    if (Math.abs(debtor.balance) < 0.01) i++;
    if (creditor.balance < 0.01) j++;
  }
  return settlements;
}

renderHome();
