// mock-db.js - Simulador de Backend e EventBus
const DB_PREFIX = 'meraki_';

const defaultData = {
    users: [
        { id: 'CMP-77X9', name: 'Tech Inova', type: 'company', balance: 50000 },
        { id: 'SPL-102X', name: 'Kauan Silva', type: 'specialist', role: 'NestJS Developer', rating: 4.9, balance: 0 }
    ],
    projects: [], // { id, title, budget, deadline, status, companyId, specialistId }
    milestones: [], // { id, projectId, title, amount, status }
    bids: [], // { id, projectId, specialistId, amount, days, coverLetter, status }
    wallet: [] // { id, type, amount, from, to, date, status } // type: 'escrow', 'release', 'fee'
};

function initDB() {
    Object.keys(defaultData).forEach(key => {
        if (!localStorage.getItem(DB_PREFIX + key)) {
            localStorage.setItem(DB_PREFIX + key, JSON.stringify(defaultData[key]));
        }
    });
}

// Global API Object
window.mockAPI = {
    // --- Users ---
    login: function(type) {
        let users = this.getCollection('users');
        let user = users.find(u => u.type === type);
        localStorage.setItem('meraki_active_user', JSON.stringify(user));
        return user;
    },
    getCurrentUser: function() {
        let userStr = localStorage.getItem('meraki_active_user');
        return userStr ? JSON.parse(userStr) : null;
    },

    // --- Collections ---
    getCollection: function(col) {
        return JSON.parse(localStorage.getItem(DB_PREFIX + col)) || [];
    },
    saveCollection: function(col, data) {
        localStorage.setItem(DB_PREFIX + col, JSON.stringify(data));
    },

    // --- Projects ---
    createProject: function(projectData, milestonesData) {
        let projects = this.getCollection('projects');
        let milestones = this.getCollection('milestones');
        let user = this.getCurrentUser();

        let newProject = {
            id: 'PRJ-' + Math.floor(Math.random() * 1000 + 1000),
            companyId: user.id,
            status: 'OPEN',
            ...projectData
        };
        projects.push(newProject);
        
        if (milestonesData && milestonesData.length > 0) {
            milestonesData.forEach((m, index) => {
                milestones.push({
                    id: 'M-' + newProject.id + '-' + (index + 1),
                    projectId: newProject.id,
                    status: 'PENDING',
                    title: m.title,
                    amount: m.amount || 0
                });
            });
        }

        this.saveCollection('projects', projects);
        this.saveCollection('milestones', milestones);
        return newProject;
    },
    getProjectsByCompany: function(companyId) {
        return this.getCollection('projects').filter(p => p.companyId === companyId);
    },
    getProjectsBySpecialist: function(specialistId) {
        return this.getCollection('projects').filter(p => p.specialistId === specialistId);
    },
    getOpenProjects: function() {
        return this.getCollection('projects').filter(p => p.status === 'OPEN');
    },
    getProjectById: function(id) {
        return this.getCollection('projects').find(p => p.id === id);
    },
    getProjects: function() {
        return this.getCollection('projects');
    },
    updateProjectStatus: function(projectId, status, specialistId = null) {
        let projects = this.getCollection('projects');
        let idx = projects.findIndex(p => p.id === projectId);
        if(idx > -1) {
            projects[idx].status = status;
            if (specialistId) {
                projects[idx].specialistId = specialistId;
            }
            this.saveCollection('projects', projects);
        }
    },

    // --- Bids ---
    createBid: function(bidData) {
        let bids = this.getCollection('bids');
        let user = this.getCurrentUser();
        let newBid = {
            id: 'BID-' + Math.floor(Math.random() * 1000 + 1000),
            specialistId: user.id,
            status: 'PENDING',
            ...bidData
        };
        bids.push(newBid);
        this.saveCollection('bids', bids);
        return newBid;
    },
    getBidsForProject: function(projectId) {
         return this.getCollection('bids').filter(b => b.projectId === projectId);
    },
    acceptBid: function(bidId) {
         let bids = this.getCollection('bids');
         let bid = bids.find(b => b.id === bidId);
         if(bid) {
             bid.status = 'ACCEPTED';
             this.saveCollection('bids', bids);
             this.updateProjectStatus(bid.projectId, 'IN_PROGRESS', bid.specialistId);

             // Move money to escrow
             this.createTransaction({
                 type: 'escrow',
                 amount: bid.amount,
                 projectId: bid.projectId,
                 from: 'company',
                 to: 'escrow',
                 status: 'RETAINED'
             });
             
             // Emit event
             window.dispatchEvent(new CustomEvent('bid.accepted', { detail: { bidId } }));
         }
    },

    // --- Milestones ---
    getMilestonesForProject: function(projectId) {
         return this.getCollection('milestones').filter(m => m.projectId === projectId);
    },
    getMilestonesByProjectId: function(projectId) {
        return this.getMilestonesForProject(projectId);
    },
    getMilestoneById: function(milestoneId) {
         return this.getCollection('milestones').find(m => m.id === milestoneId);
    },
    updateMilestoneStatus: function(milestoneId, status) {
         let milestones = this.getCollection('milestones');
         let idx = milestones.findIndex(m => m.id === milestoneId);
         if(idx > -1) {
             let oldStatus = milestones[idx].status;
             milestones[idx].status = status;
             this.saveCollection('milestones', milestones);
             
             if(status === 'APPROVED' && oldStatus !== 'APPROVED') {
                  this.releaseEscrow(milestones[idx]);
                  window.dispatchEvent(new CustomEvent('milestone.approved', { detail: { milestone: milestones[idx] } }));
             } else {
                  window.dispatchEvent(new CustomEvent('milestone.updated', { detail: { milestone: milestones[idx] } }));
             }
         }
    },

    // --- Wallet / Payment ---
    createTransaction: function(txData) {
         let wallet = this.getCollection('wallet');
         let tx = {
             id: 'TX-' + Math.floor(Math.random() * 10000),
             date: new Date().toISOString(),
             ...txData
         };
         wallet.push(tx);
         this.saveCollection('wallet', wallet);
         return tx;
    },
    getTransactions: function() {
         return this.getCollection('wallet');
    },
    releaseEscrow: function(milestone) {
         let fee = milestone.amount * 0.05; // 5% platform fee
         let netAmount = milestone.amount - fee;
         
         this.createTransaction({
             type: 'release',
             amount: netAmount,
             fee: fee,
             milestoneId: milestone.id,
             projectId: milestone.projectId,
             from: 'escrow',
             to: 'specialist',
             status: 'COMPLETED'
         });
         
         // Event bus alert mapping
         window.dispatchEvent(new CustomEvent('wallet.released', { detail: { milestoneId: milestone.id, amount: netAmount }}));
    },
    
    getEscrowBalance: function() {
        let txs = this.getTransactions();
        let added = txs.filter(t => t.type === 'escrow').reduce((acc, t) => acc + Number(t.amount), 0);
        let released = txs.filter(t => t.type === 'release').reduce((acc, t) => acc + Number(t.amount + t.fee), 0);
        return added - released;
    },
    
    // --- Clear & Seed ---
    resetDB: function() {
        Object.keys(defaultData).forEach(key => {
            localStorage.removeItem(DB_PREFIX + key);
        });
        localStorage.removeItem('meraki_active_user');
        initDB();
    }
};

// Initialize on load
initDB();

// Useful mock Event listener for debugging logic
window.addEventListener('milestone.approved', (e) => {
    console.log('[EventBus] Milestone Approved:', e.detail);
});
window.addEventListener('bid.accepted', (e) => {
    console.log('[EventBus] Bid Accepted:', e.detail);
});
window.addEventListener('wallet.released', (e) => {
    console.log('[EventBus] Funds Released:', e.detail);
});
