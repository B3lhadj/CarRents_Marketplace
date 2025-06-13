import React from 'react';
import { Link } from 'react-router-dom';
import { FaClock, FaHome } from 'react-icons/fa';

const AccountPending = () => {
    return (
        <div style={{
            display: 'flex',
            width: '100vw',
            height: '100vh',
            backgroundColor: '#f8f9fa',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '1rem',
            textAlign: 'center'
        }}>
            <div style={{
                maxWidth: '32rem',
                backgroundColor: 'white',
                borderRadius: '1rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                border: '1px solid #e5e7eb'
            }}>
                <div style={{
                    backgroundColor: '#fef3c7',
                    padding: '1.25rem',
                    borderRadius: '9999px',
                    marginBottom: '1.5rem'
                }}>
                    <FaClock style={{ color: '#f59e0b', fontSize: '3rem' }} />
                </div>
                
                <h2 style={{
                    fontSize: '1.875rem',
                    fontWeight: '700',
                    color: '#1f2937',
                    marginBottom: '0.75rem'
                }}>Account Under Review</h2>
                
                <p style={{
                    color: '#4b5563',
                    marginBottom: '2rem',
                    textAlign: 'left',
                    width: '100%'
                }}>
                    Your account is currently being reviewed by our administration team. 
                    This process typically takes 1-2 business days.
                </p>
                
                <Link 
                    to={'http://localhost:3000/'}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        fontWeight: '500',
                        borderRadius: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        width: '100%',
                        textDecoration: 'none'
                    }}
                >
                    <FaHome />
                    Return Home
                </Link>
            </div>
        </div>
    );
};

export default AccountPending;