import "./dashboard.css";

const Dashboard = () => {

return (

<div className="dashboard">


<div className="top-cards">

<div className="card">

<h3>Kết quả bán hàng hôm nay</h3>

<div className="stats">

<div>
<p>Đơn đã xong</p>
<h2>0</h2>
</div>

<div>
<p>Đang phục vụ</p>
<h2>0</h2>
</div>

<div>
<p>Khách hàng</p>
<h2>0</h2>
</div>

</div>

</div>


<div className="banner">

Giao quẻ 2026

</div>

</div>



<div className="content">

<div className="chart">

<h3>Doanh số hôm nay</h3>

<div className="empty">

Không có dữ liệu

</div>

</div>


<div className="right">

<div className="box">
Giao món siêu tốc
</div>

<div className="box">
Hoạt động gần đây
</div>

</div>


</div>


</div>

);

};

export default Dashboard;