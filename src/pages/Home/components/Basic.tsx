import { useState, useEffect } from 'react';
import { Chart } from 'primereact/chart';
import { useDashboardDataQuery } from '../../../provider/queries/Users.query';
import Loader from '../../../components/Loader'; // Assuming this is a spinner/loading indicator
import { useLocation } from 'react-router-dom';
import { Button } from 'primereact/button'; // Import Button for refresh action
import { Message } from 'primereact/message'; // Import Message for error display

export default function BasicChart() {
    // Destructure refetch from the query hook to manually trigger data fetch
    const { data, isError, isLoading, isFetching, refetch } = useDashboardDataQuery({});
    const location = useLocation();

    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});

    useEffect(() => {
        if (!data) return;

        // Ensure values are numbers and handle potential undefined/null from API
        const consumers = data.consumers || 0;
        const orders = data.orders || 0;
        const sell = data.sell || 0;
        const quantity = data.quantity || 0;

        const chartData = {
            labels: ['Users', 'Orders', 'Sell (₹)', 'Quantity'],
            datasets: [
                {
                    label: 'Total',
                    data: [consumers, orders, sell, quantity],
                    backgroundColor: [
                        'rgba(255, 159, 64, 0.7)',   // Users (more opaque)
                        'rgba(75, 192, 192, 0.7)',   // Orders
                        'rgba(54, 162, 235, 0.7)',   // Sell
                        'rgba(153, 102, 255, 0.7)'   // Quantity
                    ],
                    borderColor: [
                        'rgb(255, 159, 64)',
                        'rgb(75, 192, 192)',
                        'rgb(54, 162, 235)',
                        'rgb(153, 102, 255)'
                    ],
                    borderWidth: 1,
                    // Add hover background for interaction, similar to PieChartDemo
                    hoverBackgroundColor: [
                        'rgba(255, 159, 64, 0.9)',
                        'rgba(75, 192, 192, 0.9)',
                        'rgba(54, 162, 235, 0.9)',
                        'rgba(153, 102, 255, 0.9)'
                    ]
                }
            ]
        };

        const documentStyle = getComputedStyle(document.documentElement); // For consistent styling

        const options = {
            responsive: true,
            maintainAspectRatio: false, // Allow chart to fill its container
            plugins: {
                legend: {
                    display: false // Keeping legend hidden as in original, suitable for simple bar chart
                },
                title: { // Add a title for clarity
                    display: true,
                    text: 'Key Performance Indicators',
                    font: { size: 18, weight: 'bold' },
                    color: documentStyle.getPropertyValue('--gray-700')
                },
                tooltip: { // Enhanced tooltips for better data readability
                    enabled: true,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                // Format numbers for better readability (e.g., 1,234)
                                label += new Intl.NumberFormat('en-IN', { style: 'decimal' }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: { // X-axis (categories)
                    ticks: {
                        color: documentStyle.getPropertyValue('--gray-600')
                    },
                    grid: {
                        color: documentStyle.getPropertyValue('--gray-200')
                    }
                },
                y: { // Y-axis (values)
                    beginAtZero: true,
                    ticks: {
                        color: documentStyle.getPropertyValue('--gray-600'),
                        stepSize: Math.max(1, Math.floor(Math.max(consumers, orders, sell, quantity) / 5)), // Dynamic step size
                        callback: function(value) { // Format Y-axis labels
                            return new Intl.NumberFormat('en-IN', { style: 'decimal' }).format(value);
                        }
                    },
                    grid: {
                        color: documentStyle.getPropertyValue('--gray-200')
                    }
                }
            },
            animation: { // Add animation for engaging display
                duration: 1000, // Animation duration in milliseconds
                easing: 'easeInOutQuad' // Easing function
            }
        };

        setChartData(chartData);
        setChartOptions(options);
    }, [data, location]); // Re-run effect if data or location changes

    // --- Loading and Error States ---
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] bg-white rounded-lg shadow-md p-6">
                <Loader />
                <p className="mt-4 text-lg text-gray-600">Loading essential metrics...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] bg-red-50 rounded-lg shadow-md p-6 border border-red-200">
                <Message severity="error" text="Failed to load basic chart data. Please try again." className="mb-4" />
                <Button
                    label="Retry"
                    icon="pi pi-refresh"
                    onClick={() => refetch()} // Manual retry button
                    className="p-button-danger p-button-outlined"
                />
            </div>
        );
    }

    // --- Main Chart Render ---
    return (
        <div className="flex flex-col items-center justify-center w-full bg-white rounded-lg shadow-md p-6 min-h-[400px]">
            {isFetching && ( // Show a subtle indicator if refetching in background
                <div className="absolute top-4 right-4 text-blue-500">
                    <i className="pi pi-spin pi-spinner text-xl"></i>
                </div>
            )}
            <Chart
                type="bar" // Explicitly a bar chart
                data={chartData}
                options={chartOptions}
                // Tailwind classes for responsiveness.
                // It will be wrapped by the HomePage container which also defines width,
                // but this ensures the chart itself takes up available space.
                className="w-full h-full" // Use h-full to make it take available height in its flex container
            />
            <div className="mt-6">
                <Button
                    label="Refresh Data"
                    icon="pi pi-sync"
                    onClick={() => refetch()}
                    className="p-button-secondary p-button-sm"
                    disabled={isFetching} // Disable button while fetching
                />
            </div>
        </div>
    );
}