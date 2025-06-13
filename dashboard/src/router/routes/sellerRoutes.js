import { lazy } from 'react';

// Lazy loading components
const AddBanner = lazy(() => import("../../views/seller/AddBanner"));
const Banners = lazy(() => import("../../views/seller/Banners"));
const SellerDashboard = lazy(() => import("../../views/seller/SellerDashboard"));
const AddProduct = lazy(() => import("../../views/seller/AddProduct"));
const Products = lazy(() => import("../../views/seller/Products"));
const DiscountProducts = lazy(() => import("../../views/seller/DiscountProducts"));
const Orders = lazy(() => import("../../views/seller/Orders"));
const Payments = lazy(() => import("../../views/seller/Payments"));
const SellerToAdmin = lazy(() => import("../../views/seller/SellerToAdmin"));
const SellerToCustomer = lazy(() => import("../../views/seller/SellerToCustomer"));
const Profile = lazy(() => import("../../views/seller/Profile"));
const EditProduct = lazy(() => import("../../views/seller/EditProduct"));
const OrderDetails = lazy(() => import("../../views/seller/OrderDetails"));
const Desactive = lazy(() => import("../../views/Desactive"));
const DeleteProduct = lazy(() => import("../../views/seller/DeleteProduct")); // New route for deleting product
const SubscriptionPlans = lazy(() => import("../../views/seller/SubscriptionPlans")); // New route for Subscription Plans

const SellerBookings = lazy(() => import("../../views/seller/SellerBookings")); // New route for Subscription Plans

export const sellerRoutes = [
 
    {
        path: '/seller/account-desactive',
        element: <Desactive />,
        ability: 'seller',
    },
    {
        path: '/seller/dashboard',
        element: <SellerDashboard />,
        role: 'seller',
        status: 'active',
    },
    {
        path: '/seller/dashboard/add-product',
        element: <AddProduct />,
        role: 'seller',
        status: 'active',
    },
    {
        path: '/seller/dashboard/edit-product/:productId',
        element: <EditProduct />,
        role: 'seller',
        status: 'active',
    },

    {
        path: '/seller/dashboard/products',
        element: <Products />,
        role: 'seller',
        status: 'active',
    },
    {
        path: '/seller/dashboard/discount-products',
        element: <DiscountProducts />,
        role: 'seller',
        status: 'active',
    },
    {
        path: '/seller/dashboard/orders',
        element: <Orders />,
        role: 'seller',
        visibility: ['active', 'deactive'],
    },
    {
        path: '/seller/dashboard/order/details/:orderId',
        element: <OrderDetails />,
        role: 'seller',
        visibility: ['active', 'deactive'],
    },
    {
        path: '/seller/dashboard/payments',
        element: <Payments />,
        role: 'seller',
        status: 'active',
    },
    {
        path: '/seller/dashboard/chat-support',
        element: <SellerToAdmin />,
        role: 'seller',
        visibility: ['active', 'deactive', 'pending'],
    },
    {
        path: '/seller/dashboard/chat-customer/:customerId',
        element: <SellerToCustomer />,
        role: 'seller',
        status: 'active',
    },
    {
        path: '/seller/dashboard/chat-customer',
        element: <SellerToCustomer />,
        role: 'seller',
        status: 'active',
    },
    {
        path: '/seller/dashboard/profile',
        element: <Profile />,
        role: 'seller',
        visibility: ['active', 'deactive', 'pending'],
    },
    {
        path: '/seller/dashboard/add-banner/:productId',
        element: <AddBanner />,
        role: 'seller',
        status: 'active',
    },
    {
        path: '/seller/dashboard/banners',
        element: <Banners />,
        role: 'seller',
        status: 'active',
    },
    {
        path: '/seller/dashboard/delete-product/:productId', // New route for deleting product
        element: <DeleteProduct />,
        role: 'seller',
        status: 'active', // Ensure only active sellers can delete
    },
    {
        path: '/seller/dashboard/subscribe', // New route for SubscriptionPlans
        element: <SubscriptionPlans />,
        role: 'seller',
        status: 'active', // Ensure only active sellers can subscribe
    },
    {
    path: '/seller/dashboard/request', // New route for SubscriptionPlans
    element: <SellerBookings />,
    role: 'seller',
  // Ensure only active sellers can subscribe
}
];
