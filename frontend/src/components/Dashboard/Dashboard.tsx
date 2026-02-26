import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDollarSign,
  faClipboardCheck,
  faUserFriends,
  faArrowUp,
  faSyncAlt,
  faChevronDown,
  faInbox,
  faTruck,
  faGift,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import './Dashboard.css';

type TabType = 'Theo ngày' | 'Theo giờ' | 'Theo thứ';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('Theo giờ');

  const tabs: TabType[] = ['Theo ngày', 'Theo giờ', 'Theo thứ'];

  return (
    <div className="dashboard">
      <div className="dashboard-main">
        {/* Sales Result Card */}
        <div className="card">
          <h2 className="card-title">KẾT QUẢ BÁN HÀNG HÔM NAY</h2>
          <div className="stats-row">
            <div className="stat-item">
              <div className="stat-icon blue">
                <FontAwesomeIcon icon={faDollarSign} />
              </div>
              <div className="stat-content">
                <span className="stat-label">0 đơn đã xong</span>
                <div className="stat-value-row">
                  <span className="stat-value">0</span>
                  <span className="stat-change up">
                    <FontAwesomeIcon icon={faArrowUp} /> 100%
                  </span>
                </div>
                <span className="stat-sub">Hôm qua 0</span>
              </div>
            </div>

            <div className="stat-divider" />

            <div className="stat-item">
              <div className="stat-icon teal">
                <FontAwesomeIcon icon={faClipboardCheck} />
              </div>
              <div className="stat-content">
                <span className="stat-label">0 đơn đang phục vụ</span>
                <div className="stat-value-row">
                  <span className="stat-value">0</span>
                </div>
                <span className="stat-sub">&nbsp;</span>
              </div>
            </div>

            <div className="stat-divider" />

            <div className="stat-item">
              <div className="stat-icon purple">
                <FontAwesomeIcon icon={faUserFriends} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Khách hàng</span>
                <div className="stat-value-row">
                  <span className="stat-value">0</span>
                  <span className="stat-change up">
                    <FontAwesomeIcon icon={faArrowUp} /> 0%
                  </span>
                </div>
                <span className="stat-sub">Hôm qua 0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Chart Card */}
        <div className="card chart-card">
          <div className="chart-header">
            <div className="chart-title-row">
              <h2 className="card-title">DOANH SỐ HÔM NAY</h2>
              <button className="refresh-btn">
                <FontAwesomeIcon icon={faSyncAlt} />
              </button>
              <span className="revenue-zero">0</span>
            </div>
            <button className="period-btn">
              Hôm nay <FontAwesomeIcon icon={faChevronDown} />
            </button>
          </div>

          <div className="tabs">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="empty-chart">
            <FontAwesomeIcon icon={faInbox} className="empty-icon" />
            <p className="empty-text">Không có dữ liệu</p>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        {/* Promotion Banner */}
        <div className="promo-banner">
          <div className="promo-content">
            <div className="promo-logo">K KiotViet</div>
            <div className="promo-text">
              <p className="promo-title">GIEO QUẺ 2026</p>
              <p className="promo-sub">CÙNG HỶ PHÁT TÀI</p>
            </div>
          </div>
          <div className="promo-decoration">🎋</div>
        </div>

        {/* Fast Delivery */}
        <div className="sidebar-card">
          <div className="sidebar-card-content">
            <FontAwesomeIcon icon={faTruck} className="sidebar-icon green" />
            <div>
              <p className="sidebar-card-title">Giao món siêu tốc</p>
              <p className="sidebar-card-sub">Tạo đơn Ahamove, XanhSM, Grab chỉ 30s</p>
            </div>
          </div>
          <FontAwesomeIcon icon={faArrowRight} className="sidebar-arrow" />
        </div>

        {/* Recent Activity */}
        <div className="sidebar-card activities">
          <h3 className="activities-title">
            <FontAwesomeIcon icon={faGift} className="activities-icon" />
            CÁC HOẠT ĐỘNG GẦN ĐÂY
          </h3>
          <div className="activities-empty">
            <div className="activity-skeleton" />
            <div className="activity-skeleton short" />
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Dashboard;