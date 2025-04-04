import React, { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Link } from "react-router-dom";
import inventoryImage from "../sources/images/kho-hang-slide.png";
import { useNavigate } from 'react-router-dom';
import { fetchInventoryImports } from '../redux/slice/InventoryImportSlice'; 
import { fetchPurchaseOrderByPendingStatus } from '../redux/slice/PurchaseOrderSlice';
import { getTotalQuantity, fetchMedicineNearExpiration} from '../redux/slice/InventoryDetailSlice';

export const MainHome = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { inventoryImport = [], loading, error } = useSelector((state) => state.inventoryImport || {});
    const { inventoryDetail = [], loading: inventoryLoading, error: inventoryError } = useSelector((state) => state.inventoryDetail || {});
    const { purchaseOrderByPendingStatus = [], loading: orderPendingLoading, error: orderPendingError } = useSelector((state) => state.purchaseOrderByPendingStatus);
    const { totalProduct = 0 } = useSelector((state) => state.inventoryDetail || {});

    // Lấy tổng số lượng thuốc từ Redux
    useEffect(() => {
        dispatch(getTotalQuantity());
    }, [dispatch]);

    // Lấy danh sách thuốc sắp hết hạn từ Redux
    useEffect(() => {
        dispatch(fetchMedicineNearExpiration({ page: 0, size: 1000, sortBy: 'id', sortName: 'asc' }));
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchInventoryImports({ page: 0, size: 1000, sortBy: 'importDate', sortName: 'desc' }));
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchPurchaseOrderByPendingStatus({ page: 0, size: 1000, sortBy: 'orderDate', sortName: 'desc' }));
    }, [dispatch]);

     // Tính tổng số lượng đơn nhập có status là 'PENDING'
     const pendingInventoryCount = inventoryImport.filter(item => item.status === 'PENDING').length;

    const handleInventoryPending = (e) => {
        navigate('/import?filter=pending', { state: { activeTab: 'list' } });
    };

    const handlePurchasePending = (e) => {
        navigate('/import', { state: { activeTab: 'purchare-order' } });
    };

    const handleMecineExpiration = (e) => {
        navigate('/inventory-control?filter=near-expired');
    }

    const formattedQuantity = totalProduct.toLocaleString('vi-VN');

    return (
        <div className="flex flex-col h-screen mb-32">
            {/* Hình ảnh kho phía trên cùng */}
            <div className="bg-cover bg-center h-48" style={{ backgroundImage: `url(${inventoryImage})` }}>
                <div className="h-full bg-black bg-opacity-50 flex items-center justify-center">
                    <h1 className="text-white text-4xl font-bold">Quản lý Kho Thuốc</h1>
                </div>
            </div>

            <div className="flex flex-1 mx-16">
                {/* Main Content */}
                <main className="flex-1 p-6 bg-gray-50">
                    <h1 className="text-2xl font-bold mb-4">Tổng quan kho thuốc</h1>

                    {/* Thông tin tổng quan */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-white shadow rounded-lg cursor-pointer hover:bg-gray-300">
                            <h2 className="text-lg font-semibold">Tổng số lượng thuốc</h2>
                            <p className="text-2xl text-blue-600">{formattedQuantity}</p>
                        </div>
                        <div className="p-4 bg-white shadow rounded-lg cursor-pointer hover:bg-gray-300" onClick={handleMecineExpiration} >
                            <h2 className="text-lg font-semibold">Thuốc sắp hết hạn</h2>
                            <p className="text-2xl text-red-600">{inventoryDetail.length}</p>
                        </div>
                        <div className="p-4 bg-white shadow rounded-lg cursor-pointer hover:bg-gray-300" onClick={handleInventoryPending} >
                            <h2 className="text-lg font-semibold">Lô hàng chờ nhập</h2>
                            <p className="text-2xl text-green-600">{pendingInventoryCount}</p>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white shadow rounded-lg cursor-pointer hover:bg-gray-300" onClick={handlePurchasePending}>
                            <h2 className="text-lg font-semibold">Đơn hàng chờ xử lý</h2>
                            <p className="text-2xl text-orange-600">{purchaseOrderByPendingStatus.length}</p>
                        </div>
                        <div className="p-4 bg-white shadow rounded-lg cursor-pointer hover:bg-gray-300">
                            <h2 className="text-lg font-semibold">Tỷ lệ thuốc hỏng</h2>
                            <p className="text-2xl text-gray-600">2%</p>
                        </div>
                    </div>

                    {/* Các button to để navigation */}
                    <div className="mt-8 grid grid-cols-2 gap-4">
                        <Link to="/suplier" className="block p-6 bg-blue-500 text-white text-center rounded-lg shadow hover:bg-blue-600">
                            <h2 className="text-xl font-semibold">Nhà cung cấp</h2>
                        </Link>

                        <Link to="/staff" className="block p-6 bg-green-500 text-white text-center rounded-lg shadow hover:bg-green-600">
                            <h2 className="text-xl font-semibold">Nhân sự</h2>
                        </Link>


                        <Link to="/divide-category-medicine" className="block p-6 bg-purple-500 text-white text-center rounded-lg shadow hover:bg-purple-600">
                            <h2 className="text-xl font-semibold">Phân loại thuốc</h2>
                        </Link>

                        <Link to="/report" className="block p-6 bg-teal-500 text-white text-center rounded-lg shadow hover:bg-teal-600">
                            <h2 className="text-xl font-semibold">Thống kê</h2>
                        </Link>

                    </div>
                </main>
            </div>
        </div>
    );
};
