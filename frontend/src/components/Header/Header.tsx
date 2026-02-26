import "./header.css";

const Header = () => {
  return (
    <div className="header">

      <div className="logo">
        KiotViet
      </div>

      <div className="header-right">

        <span>Thanh toán</span>
        <span>Vay vốn</span>
        <span>Hỗ trợ</span>

        <div className="user">
            Admin
        </div>

      </div>

    </div>
  );
};

export default Header;