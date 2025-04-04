import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { fetchSuppliers } from '../redux/slice/SupplierSlice';
import { addSupplier } from '../redux/slice/SupplierSlice';
import { fetchCategorys } from '../redux/slice/CategorySlice';
import { fetchMedicinesByCategoryTitle } from '../redux/slice/MedicineSlice';
import showToast from '../utils/AppUtils';
import { fetchMedicineById } from '../redux/slice/MedicineSlice';
import { createPurchaseOrder } from '../redux/slice/PurchaseOrderSlice';
import {verifyOrder} from '../redux/slice/PurchaseOrderSlice';

export const PurchaseOfferPage = () => {
    const [productName, setProductName] = useState('');
    const [category, setCategory] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [discount, setDiscount] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [products, setProducts] = useState([]);
    const [supplierName, setSupplierName] = useState('');
    const [supplierAddress, setSupplierAddress] = useState('');
    const [supplierContactInfo, setSupplierContactInfo] = useState('');
    const [showSupplierModal, setShowSupplierModal] = useState(false);
    const [addedProducts, setAddedProducts] = useState([]); // New state to store added products
    // const [activeTab, setActiveTab] = useState('purchare-order');
    const navigate = useNavigate();

    const dispatch = useDispatch();

    // Lấy dữ liệu từ Redux store
    const { supplier, loading, error } = useSelector((state) => state.supplier);
    const { categorys } = useSelector((state) => state.categorys);
    const { medicines } = useSelector((state) => state.medicine);

    useEffect(() => {
        dispatch(verifyOrder({}));
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchSuppliers({}));
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchCategorys({}));
    }, [dispatch]);


    const handleAddRequest = (e) => {
        e.preventDefault();

        if (addedProducts.length === 0) {
            showToast("Vui lòng thêm ít nhất một sản phẩm vào danh sách.", 'error');
            return; // Nếu không có sản phẩm nào, ngừng thực hiện.
        }
    
        if (!selectedSupplier) {
            showToast("Vui lòng chọn nhà cung cấp.", 'error');
            return; // Nếu không có nhà cung cấp được chọn, ngừng thực hiện.
        }
    
        // Tạo đối tượng đơn mua từ danh sách các sản phẩm đã thêm
        const purchaseOrder = {
            supplierId: selectedSupplier,
            purchaseOrderDetails: addedProducts.map(product => ({
                medicine: product.productId, 
                category: product.categoryId,
                quantity: product.quantity,
                price: product.price,
                discount: product.discount,
                expirationDate: product.expiryDate
            }))
        };
    
        // Dispatch action createPurchaseOrder
        dispatch(createPurchaseOrder(purchaseOrder))
            .then(() => {
                showToast("Đơn mua đã được tạo thành công.", 'success');
                navigate('/import',{ state: { activeTab: 'purchare-order' }}); // Chuyển hướng tới trang nhập kho
            })
            .catch((error) => {
                showToast("Đã có lỗi xảy ra khi tạo đơn mua.", 'error');
                console.log(error);
            });
    };

    const handleAddSupplier = (e) => {
        e.preventDefault();

        // Kiểm tra xem các trường có bị bỏ trống không
        if (!supplierName || !supplierContactInfo || !supplierAddress) {
            showToast("Vui lòng điền đầy đủ thông tin.", 'error');
            return; // Ngừng thực hiện nếu có trường bị thiếu
        }

        const newSupplier = {
            name: supplierName,
            contactInfo: supplierContactInfo,
            address: supplierAddress,
        };

        // Dispatch action to add the new supplier using Redux
        dispatch(addSupplier(newSupplier))
            .then(() => {
                setShowSupplierModal(false);
                showToast("Thêm nhà cung cấp thành công.", 'success');
            })
            .catch((error) => {
                showToast("Đã có lỗi xảy ra khi thêm.", 'error');
                console.log(error);
            });
    };

    const handleCategoryChange = async (e) => {
        const selectedCategory = e.target.value;
        setCategory(selectedCategory);
        setSelectedProduct(''); 

        const selectedOption = e.target.selectedOptions[0];
        const categoryId = selectedOption ? selectedOption.dataset.id : '';
        setCategoryId(categoryId);

        if (selectedCategory) {
            // Gọi API lấy thuốc theo danh mục
            dispatch(fetchMedicinesByCategoryTitle({ title: selectedCategory }));
        }
    };

    useEffect(() => {
        if (medicines && medicines.length > 0) {
            setProducts(medicines);
        }
    }, [medicines]);

    const handleProductChange = (e) => {
        const selectedProductId = e.target.value;
        setSelectedProduct(selectedProductId);
        dispatch(fetchMedicineById(selectedProductId));
    }

    useEffect(() => {
        if (medicines) {
            setPrice(medicines.price);
            setDiscount(medicines.discount);
        }
    }, [medicines]);


    const handleAddToList = () => {
        if (selectedProduct && quantity && price) {
            const newProduct = {
                productName: medicines.name,
                productId: medicines.id,
                category: category,
                categoryId: categoryId,
                quantity,
                price: medicines.price,
                discount,
                expiryDate
            };
            setAddedProducts((prev) => [...prev, newProduct]);
            // setProductName('');
            // setQuantity('');
            // setPrice('');
            // setDiscount('');
            // setExpiryDate('');
        } else {
            alert('Vui lòng điền đầy đủ thông tin');
        }
    };


    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;


    return (
        <div className="bg-gray-100 text-gray-900 min-h-screen">
            <Header />
            <main className="p-8 mb-64 w-900">
                <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-3xl font-semibold text-center mb-8 text-indigo-600">Đề Nghị Mua Hàng</h2>
                    <form onSubmit={handleAddRequest} className="space-y-6">
                        {/* ComboBox for Supplier */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Chọn Nhà Cung Cấp</label>
                            <div className="flex items-center">
                                <select
                                    value={selectedSupplier}
                                    onChange={(e) => setSelectedSupplier(e.target.value)}
                                    className="p-3 border border-gray-300 rounded-lg w-3/4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                >
                                    <option value="">Chọn nhà cung cấp</option>
                                    {supplier && supplier.length > 0 ? (
                                        supplier.map((supplierItem, index) => (
                                            <option key={index} value={supplierItem.id}>
                                                {supplierItem.name}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="">Không có nhà cung cấp nào</option>
                                    )}
                                </select>

                                <button
                                    type="button"
                                    onClick={() => setShowSupplierModal(true)}
                                    className="ml-2 bg-indigo-600 text-white px-2 py-1 rounded pl-3 pr-3 pt-2 pb-2"
                                >
                                    Thêm Nhà Cung Cấp
                                </button>
                            </div>
                        </div>

                        {/* ComboBox for Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Danh Mục</label>
                            <select
                                value={category}
                                onChange={handleCategoryChange}
                                className="p-4 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            >
                                <option value="">Chọn danh mục</option>
                                {categorys && categorys.length > 0 ? (
                                    categorys.map((categorysItem, index) => (
                                        <option key={index} value={categorysItem.title} data-id={categorysItem.id}>
                                            {categorysItem.title}
                                        </option>
                                    ))
                                ) : (
                                    <option value="">Không có danh mục nào</option>
                                )}
                            </select>
                        </div>

                        {/* ComboBox for Product */}
                        {/* ComboBox for Product */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tên Thuốc</label>
                            <select
                                value={selectedProduct}
                                onChange={handleProductChange}
                                className="p-4 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            >
                                <option value="">Chọn Thuốc</option>
                                {products.map((product, index) => (
                                    <option key={index} value={product.id}> {/* Assuming `product.id` is the unique identifier */}
                                        {product.name} {/* Assuming `product.name` is the display name */}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Quantity and Price Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Giá</label>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="p-4 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Nhập giá"
                                    required
                                    disabled
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Giảm Giá</label>
                                <input
                                    type="number"
                                    value={discount}
                                    onChange={(e) => setDiscount(e.target.value)}
                                    className="p-4 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Nhập giảm giá"
                                    required
                                    disabled
                                />
                            </div>
                        </div>

                        {/* Discount and Expiry Date Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Số Lượng</label>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    className="p-4 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Nhập số lượng"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Ngày Hết Hạn</label>
                                <input
                                    type="date"
                                    value={expiryDate}
                                    onChange={(e) => setExpiryDate(e.target.value)}
                                    className="p-4 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                        </div>

                        {/* Add to list Button */}
                        <button
                            type="button"
                            onClick={handleAddToList}
                            className="bg-green-500 text-white py-2 px-4 rounded mt-6 hover:bg-green-600 transition duration-300"
                        >
                            Thêm Vào Danh Sách
                        </button>

                        {/* Display added products */}
                        {addedProducts.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-xl font-semibold text-gray-700">Danh Sách Sản Phẩm Đã Thêm</h3>
                                <ul className="space-y-2 mt-4">
                                    {addedProducts.map((product, index) => (
                                        <li key={index} className="border p-4 rounded-lg">
                                            <p><strong>Sản phẩm:</strong> {product.productName}</p>
                                            <p><strong>Danh mục:</strong>{product.category}</p>
                                            <p><strong>Số lượng:</strong> {product.quantity}</p>
                                            <p><strong>Giá:</strong> {product.price}</p>
                                            <p><strong>Giảm giá:</strong> {product.discount}</p>
                                            <p><strong>Ngày hết hạn:</strong> {product.expiryDate}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Confirmation Button */}
                        <button
                            type="submit"
                            className="bg-indigo-600 text-white py-3 px-6 rounded-lg mt-6 w-full hover:bg-indigo-700 transition duration-300"
                            onCanPlay={handleAddRequest}
                        >
                            Xác Nhận
                        </button>
                    </form>
                </div>
            </main>
            <Footer />

            {/* Modal Add Supplier */}
            {showSupplierModal && (
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50"
                    onClick={() => setShowSupplierModal(false)}
                >
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold mb-4">Thêm Nhà Cung Cấp</h3>
                        <input
                            type="text"
                            className="p-4 border border-gray-300 rounded-lg w-full mb-4"
                            placeholder="Tên Nhà Cung Cấp"
                            value={supplierName}
                            onChange={(e) => setSupplierName(e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            className="p-4 border border-gray-300 rounded-lg w-full mb-4"
                            placeholder="Địa Chỉ"
                            value={supplierAddress}
                            onChange={(e) => setSupplierAddress(e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            className="p-4 border border-gray-300 rounded-lg w-full mb-4"
                            placeholder="Thông Tin Liên Hệ"
                            value={supplierContactInfo}
                            onChange={(e) => setSupplierContactInfo(e.target.value)}
                            required
                        />
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowSupplierModal(false)}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded mr-2"
                            >
                                Hủy
                            </button>
                            <button
                                type='submit'
                                onClick={handleAddSupplier}
                                className="bg-blue-500 text-white px-4 py-2 rounded"
                            >
                                Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
