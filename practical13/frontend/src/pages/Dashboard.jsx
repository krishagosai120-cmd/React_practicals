import { useState } from 'react';
import {
  LayoutDashboard,
  Files,
  Upload,
  Search,
  Settings,
  LogOut,
  FileText,
  FileImage,
  FileSpreadsheet,
  File,
  Plus,
  Bell,
  MoreVertical,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const documents = [
    { name: 'Project Proposal.pdf', category: 'Work', size: '2.4 MB', date: 'Today', type: 'pdf' },
    { name: 'Annual Report.xlsx', category: 'Finance', size: '1.8 MB', date: 'Yesterday', type: 'sheet' },
    { name: 'Team Photo.png', category: 'Personal', size: '3.2 MB', date: '20 Oct 2026', type: 'image' },
    { name: 'Meeting Notes.docx', category: 'Work', size: '840 KB', date: '18 Oct 2026', type: 'doc' },
  ];

  const filteredDocuments = documents.filter((document) =>
    document.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getFileIcon = (type) => {
    if (type === 'image') return <FileImage size={22} />;
    if (type === 'sheet') return <FileSpreadsheet size={22} />;
    if (type === 'pdf' || type === 'doc') return <FileText size={22} />;
    return <File size={22} />;
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="logo">
          <span className="logo-icon"><Files size={23} /></span>
          DocuVault
        </div>

        <p className="sidebar-heading">WORKSPACE</p>

        <button className="nav-link active">
          <LayoutDashboard size={18} /> Dashboard
        </button>

        <button className="nav-link">
          <Files size={18} /> My Documents
        </button>

        <button className="nav-link">
          <Upload size={18} /> Upload Files
        </button>

        <div className="sidebar-bottom">
          <button className="nav-link">
            <Settings size={18} /> Settings
          </button>
          <button className="nav-link" onClick={handleLogout}>
            <LogOut size={18} /> Sign Out
          </button>
          <div className="sidebar-user">
            <div className="avatar">
              {(user.name || user.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <strong>{user.name || 'DocuVault User'}</strong>
              <small>{user.email || 'Signed-in account'}</small>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="breadcrumb">Workspace / Dashboard</span>
            <h2>Dashboard</h2>
          </div>
          <div className="topbar-actions">
            <button className="icon-button" aria-label="Notifications">
              <Bell size={19} />
            </button>
            <div className="profile-badge">
              {(user.name || user.email || 'U').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <section className="dashboard-content">
          <div className="welcome-section">
            <div>
              <h1>Welcome back, {user.name?.split(' ')[0] || 'there'}!</h1>
              <p>Manage your documents securely, all in one place.</p>
            </div>
            <button
              className="primary-btn upload-main-btn"
              onClick={() => alert('Document upload will be connected to the backend next.')}
            >
              <Plus size={18} /> Upload Document
            </button>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon"><Files size={22} /></div>
              <p>Total Documents</p>
              <h2>4</h2>
              <small>Across your workspace</small>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><FileText size={22} /></div>
              <p>PDF & Documents</p>
              <h2>2</h2>
              <small>Work and personal files</small>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><FileImage size={22} /></div>
              <p>Images</p>
              <h2>1</h2>
              <small>Visual files stored</small>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><FileSpreadsheet size={22} /></div>
              <p>Spreadsheets</p>
              <h2>1</h2>
              <small>Reports and data</small>
            </div>
          </div>

          <section className="content-card">
            <div className="documents-header">
              <div>
                <h3>Recent Documents</h3>
                <p>Your recently added files</p>
              </div>
              <div className="search-box">
                <Search size={17} />
                <input
                  type="search"
                  placeholder="Search documents..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>

            <div className="document-table">
              <div className="document-row document-table-heading">
                <span>NAME</span>
                <span>CATEGORY</span>
                <span>SIZE</span>
                <span>MODIFIED</span>
                <span></span>
              </div>

              {filteredDocuments.map((document) => (
                <div className="document-row" key={document.name}>
                  <div className="document-name">
                    <span className="file-icon">{getFileIcon(document.type)}</span>
                    <span>{document.name}</span>
                  </div>
                  <span className="category-tag">{document.category}</span>
                  <span>{document.size}</span>
                  <span>{document.date}</span>
                  <button className="icon-button" aria-label={`Options for ${document.name}`}>
                    <MoreVertical size={18} />
                  </button>
                </div>
              ))}

              {filteredDocuments.length === 0 && (
                <div className="empty-state">
                  <Files size={32} />
                  <p>No matching documents found.</p>
                </div>
              )}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;