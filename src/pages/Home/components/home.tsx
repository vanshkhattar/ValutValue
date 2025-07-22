import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message'; // Import Message component for feedback

const features = [
    { name: 'Dashboard', path: '/dashboard', icon: 'pi pi-chart-bar' },
    { name: 'Profile', path: '/profile', icon: 'pi pi-user' },
    { name: 'Settings', path: '/settings', icon: 'pi pi-cog' },
    { name: 'Reports', path: '/reports', icon: 'pi pi-file-excel' }, // Added a new feature
];

const Home = () => {
    // State to keep track of which feature was "activated" last
    const [lastActivatedFeature, setLastActivatedFeature] = useState(null);

    const handleFeatureActivate = (featureName) => {
        setLastActivatedFeature(featureName);
        // In a real app, you might trigger an actual action here
        console.log(`${featureName} feature activated locally!`);

        // Optionally, clear the message after a few seconds
        setTimeout(() => {
            setLastActivatedFeature(null);
        }, 3000);
    };

    return (
        <section className="min-h-screen bg-gradient-to-tr from-white via-red-50 to-blue-100 px-6 py-10">
            <div className="max-w-5xl mx-auto text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome Back 👋</h1>
                <p className="text-gray-600 text-lg mb-4">
                    Access all your features in one place
                </p>

                {lastActivatedFeature && (
                    <div className="mb-6 flex justify-center">
                        <Message
                            severity="success"
                            text={`"${lastActivatedFeature}" is ready!`}
                            className="fadein animation-duration-500"
                        />
                    </div>
                )}

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature) => (
                        <Card
                            key={feature.name}
                            title={
                                <h2 className="text-xl font-semibold text-gray-700 flex items-center justify-center">
                                    <i className={`${feature.icon} text-2xl mr-3 text-red-500`}></i>
                                    {feature.name}
                                </h2>
                            }
                            className={`shadow-md border border-gray-200 rounded-2xl hover:shadow-lg transition duration-300 transform hover:-translate-y-1
                                ${lastActivatedFeature === feature.name ? 'ring-2 ring-offset-2 ring-red-400 border-red-500' : ''}
                            `}
                        >
                            <p className="text-gray-500 text-sm mb-4">
                                Explore and manage your {feature.name.toLowerCase()} here.
                            </p>
                            <div className="flex justify-center mt-4 space-x-3">
                                {/* Button to 'activate' the feature locally */}
                                <Button
                                    label="Activate"
                                    icon="pi pi-check"
                                    className="p-button-sm p-button-outlined p-button-secondary"
                                    onClick={() => handleFeatureActivate(feature.name)}
                                />
                                {/* Button to navigate to the feature page */}
                                <Link to={feature.path}>
                                    <Button label="Go to Page" icon="pi pi-arrow-right" iconPos="right" className="bg-red-500 text-white px-5 py-2 rounded-lg" />
                                </Link>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Home;