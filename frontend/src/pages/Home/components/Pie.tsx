import { useState, useEffect } from 'react';
import { Chart } from 'primereact/chart';
import { useDashboardDataQuery } from '../../../provider/queries/Users.query';
import { useLocation } from 'react-router-dom';
import Loader from '../../../components/Loader'; // Assuming this is a spinner/loading indicator
import { Button } from 'primereact/button'; // Import Button for refresh action
import { Message } from 'primereact/message'; // Import Message for error display

export default function PieChartDemo() {
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});
    // Destructure refetch from the query hook to manually trigger data fetch
    const { data, isError, isLoading, isFetching, refetch } = useDashboardDataQuery({});
    const location = useLocation();

    useEffect(() => {
        if (!data) return;

        const documentStyle = getComputedStyle(document.documentElement);

        /* ---------- labels & values ---------- */
        // Ensure values are numbers and handle potential undefined/null from API
        const labels = ['Users', 'Orders', 'Sales', 'Quantity'];
        const values = [
            data.consumers || 0,
            data.orders || 0,
            data.sell || 0,
            data.quantity || 0
        ];

        /* ---------- colours ---------- */
        const backgroundColor = [
            documentStyle.getPropertyValue('--blue-500'),
            documentStyle.getPropertyValue('--yellow-500'),
            documentStyle.getPropertyValue('--green-500'),
            documentStyle.getPropertyValue('--purple-500') // Using purple for variety, ensure it's defined in your PrimeReact theme
        ];
        const hoverBackgroundColor = [
            documentStyle.getPropertyValue('--blue-400'),
            documentStyle.getPropertyValue('--yellow-400'),
            documentStyle.getPropertyValue('--green-400'),
            documentStyle.getPropertyValue('--purple-400')
        ];

        /* ---------- assemble dataset ---------- */
        setChartData({
            labels,
            datasets: [
                {
                    data: values,
                    backgroundColor,
                    hoverBackgroundColor
                }
            ]
        });

        /* ---------- Chart Options for Responsiveness and Interactivity ---------- */
        setChartOptions({
            responsive: true, // Chart will resize with its container
            maintainAspectRatio: false, // Allows the chart to fill its container
            plugins: {
                legend: {
                    position: 'right', // Place legend on the right for larger screens
                    labels: {
                        usePointStyle: true, // Use circles for legend items
                        font: { size: 14 } // Slightly larger font for readability
                    },
                    // Legend is interactive: clicking an item toggles its corresponding slice
                },
                tooltip: {
                    enabled: true, // Enable tooltips on hover
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed !== null) {
                                label += new Intl.NumberFormat('en-IN', { style: 'decimal' }).format(context.parsed);
                            }
                            return label;
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Dashboard Key Metrics Distribution',
                    font: { size: 18, weight: 'bold' },
                    color: documentStyle.getPropertyValue('--gray-700')
                }
            },
            animation: {
                animateScale: true, // Scale animation on initial render
                animateRotate: true // Rotate animation on initial render
            }
        });
    }, [data, location]); // Re-run effect if data or location changes

    // --- Loading and Error States ---
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] bg-white rounded-lg shadow-md p-6">
                <Loader />
                <p className="mt-4 text-lg text-gray-600">Fetching the latest dashboard insights...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] bg-red-50 rounded-lg shadow-md p-6 border border-red-200">
                <Message severity="error" text="Failed to load dashboard data. Please try again." className="mb-4" />
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
                type="pie"
                data={chartData}
                options={chartOptions}
                // Adjusting width responsively. On small screens, take full width. On medium, 3/4, on large, 1/2.
                // Using flex container with items-center will keep it centered.
                className="w-full md:w-3/4 lg:w-1/2 aspect-square" // aspect-square helps maintain a good ratio
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