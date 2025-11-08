// D:\socialadify\frontend\src\components\InsightsDataRangePicker.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { DateRange, DayPicker } from 'react-day-picker';
import { format } from 'date-fns';

// --- Icons ---
const CalendarIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12v-.008zM9.75 15h.008v.008H9.75v-.008zM9.75 12h.008v.008H9.75v-.008zM15 15h.008v.008H15v-.008zM15 12h.008v.008H15v-.008zM17.25 15h.008v.008H17.25v-.008zM17.25 12h.008v.008H17.25v-.008z" />
    </svg>
);

interface Props {
    range: DateRange | undefined;
    onRangeChange: (range: DateRange | undefined) => void;
}

export default function InsightsDateRangePicker({ range, onRangeChange }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    // Handle clicks outside the popover to close it
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [popoverRef]);

    // Format the date for the button
    const buttonText = range?.from
        ? range.to
            ? `${format(range.from, "LLL dd, y")} - ${format(range.to, "LLL dd, y")}`
            : format(range.from, "LLL dd, y")
        : "Select Date Range";

    return (
        <>
            {/* --- STYLES ADDED HERE --- */}
            {/* We use <style jsx global> to apply these styles to the 
                react-day-picker component, which renders outside this component's scope. */}
            <style jsx global>{`
                .dark-datepicker {
                    --rdp-cell-size: 36px;
                    --rdp-caption-font-size: 1rem;
                    --rdp-accent-color: rgb(79 70 229); /* indigo-600 */
                    --rdp-background-color: rgb(100 116 139 / 0.2); /* slate-600 / 20% */
                    
                    --rdp-color: rgb(226 232 240); /* slate-200 */
                    --rdp-accent-color-dark: var(--rdp-accent-color);
                }
                
                .dark-datepicker .rdp-caption_label {
                    color: rgb(241 245 249); /* slate-50 */
                    font-weight: 600;
                }
                
                .dark-datepicker .rdp-nav_button {
                    color: rgb(148 163 184); /* slate-400 */
                    transition: color 0.15s ease-in-out;
                }
                .dark-datepicker .rdp-nav_button:hover {
                    color: rgb(241 245 249); /* slate-50 */
                    background-color: rgb(51 65 85); /* slate-700 */
                }
                
                .dark-datepicker .rdp-head_cell {
                    color: rgb(148 163 184); /* slate-400 */
                    font-size: 0.8rem;
                    font-weight: 500;
                }
                
                .dark-datepicker .rdp-day {
                    color: rgb(203 213 225); /* slate-300 */
                    transition: background-color 0.15s ease-in-out, color 0.15s ease-in-out;
                }
                
                .dark-datepicker .rdp-day_today {
                    font-weight: 700;
                    color: rgb(234 179 8); /* yellow-500 */
                }
                
                .dark-datepicker .rdp-day:hover {
                    background-color: rgb(51 65 85); /* slate-700 */
                }
                
                .dark-datepicker .rdp-day_outside {
                    color: rgb(71 85 105); /* slate-600 */
                }
                
                .dark-datepicker .rdp-day_selected {
                    background-color: var(--rdp-accent-color);
                    color: white;
                }
                .dark-datepicker .rdp-day_selected:hover {
                    background-color: rgb(99 102 241); /* indigo-500 */
                }
                
                .dark-datepicker .rdp-day_range_start,
                .dark-datepicker .rdp-day_range_end {
                    background-color: var(--rdp-accent-color) !important;
                    color: white !important;
                }
                
                .dark-datepicker .rdp-day_range_middle {
                    background-color: var(--rdp-background-color);
                    color: var(--rdp-color);
                    border-radius: 0;
                }
            `}</style>

            <div className="relative w-full md:w-auto" ref={popoverRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex w-full md:w-auto items-center justify-center gap-2 h-10 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-sm hover:bg-slate-700/50 hover:border-slate-600 transition-colors"
                >
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    {buttonText}
                </button>

                {isOpen && (
                    <div className="absolute top-12 right-0 z-50 mt-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-4">
                        <DayPicker
                            mode="range"
                            selected={range}
                            onSelect={onRangeChange}
                            numberOfMonths={1}
                            className="dark-datepicker" // This class matches our styles
                            defaultMonth={range?.from}
                            showOutsideDays
                            fixedWeeks
                        />
                    </div>
                )}
            </div>
        </>
    );
}