import RouterCustom from './routes/RouterCustom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function App() {
  return (
    <div>
      {/* Các component và router của bạn sẽ nằm ở đây */}
      <RouterCustom />

      {/* Đặt ToastContainer ở đây */}
      <ToastContainer
        position="top-right" // Vị trí hiển thị
        autoClose={3000}     // Tự động đóng sau 3 giây
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light" // hoặc "dark", "colored"
      />
    </div>
  );
}

export default App;