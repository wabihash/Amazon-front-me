import React, { useState, useEffect } from 'react';
import { db } from '../../Utility/Firebase';
import classes from './AIAdmin.module.css';
import { FaSave, FaRobot, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';

const AIAdmin = () => {
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState({
        assistantName: 'Amazon AI',
        developerBio: 'Wabi - Full Stack Developer',
        siteFeatures: 'Shopping Cart, Wishlist, Stripe Checkout, Firebase Auth, Admin Panel',
        shippingInfo: 'Worldwide delivery (Ethiopia, USA, EU). 3-5 days standard.',
        returnPolicy: '30-day return policy for unopened items.',
        systemPrompt: 'You are a helpful and professional AI shopping assistant for Wabis Amazon Clone. You speak in a polite, efficient tone.'
    });

    useEffect(() => {
        // Fetch existing config from Firestore
        const fetchConfig = async () => {
            try {
                const doc = await db.collection('assistant_config').doc('main').get();
                if (doc.exists) {
                    setConfig(doc.data());
                }
            } catch (err) {
                console.error("Error fetching AI config:", err);
            }
        };
        fetchConfig();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await db.collection('assistant_config').doc('main').set(config);
            toast.success("AI Knowledge Base Updated!");
        } catch (err) {
            toast.error("Failed to update AI: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={classes.aiAdminContainer}>
            <div className={classes.header}>
                <FaRobot className={classes.headerIcon} />
                <h2>AI Command Center</h2>
            </div>
            <p className={classes.subtitle}>Teach your AI Assistant everything about this project.</p>

            <form onSubmit={handleSave} className={classes.configForm}>
                <div className={classes.grid}>
                    <div className={classes.inputGroup}>
                        <label>AI Assistant Name</label>
                        <input 
                            name="assistantName" 
                            value={config.assistantName} 
                            onChange={handleChange} 
                            placeholder="e.g. Amazon AI"
                        />
                    </div>

                    <div className={classes.inputGroup}>
                        <label>Developer Identity (You)</label>
                        <input 
                            name="developerBio" 
                            value={config.developerBio} 
                            onChange={handleChange} 
                            placeholder="Tell the AI who you are..."
                        />
                    </div>

                    <div className={classes.inputGroupFull}>
                        <label>Site Features</label>
                        <textarea 
                            name="siteFeatures" 
                            value={config.siteFeatures} 
                            onChange={handleChange} 
                            placeholder="List your project features..."
                        />
                    </div>

                    <div className={classes.inputGroupHalf}>
                        <label>Shipping Information</label>
                        <textarea 
                            name="shippingInfo" 
                            value={config.shippingInfo} 
                            onChange={handleChange} 
                            placeholder="Delivery zones and times..."
                        />
                    </div>

                    <div className={classes.inputGroupHalf}>
                        <label>Return Policy</label>
                        <textarea 
                            name="returnPolicy" 
                            value={config.returnPolicy} 
                            onChange={handleChange} 
                            placeholder="How returns work..."
                        />
                    </div>

                    <div className={classes.inputGroupFull}>
                        <label>AI Personality / Main Prompt (How he talks)</label>
                        <textarea 
                            name="systemPrompt" 
                            value={config.systemPrompt} 
                            onChange={handleChange} 
                            placeholder="e.g. You are a friendly funny assistant who loves emojis..."
                        />
                    </div>
                </div>

                <div className={classes.infoBox}>
                    <FaInfoCircle />
                    <span>Any changes you save here will be instantly pushed to the floating ChatBot.</span>
                </div>

                <button type="submit" className={classes.saveBtn} disabled={loading}>
                    {loading ? "Syncing..." : <><FaSave /> Save AI Persona</>}
                </button>
            </form>
        </div>
    );
};

export default AIAdmin;
