import React from 'react';

interface FilterStatsProps {
  onFilterChange: React.Dispatch<React.SetStateAction<Record<string, number> | null>>; // Update the type here
}

const FilterStats: React.FC<FilterStatsProps> = ({ onFilterChange }) => {
  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFilter = event.target.value;
    // You can define how the filter should be applied here
    // For now, let's assume newFilter is just a string to set as a key
    onFilterChange({ [newFilter]: 0 }); // Just an example of setting a filter
  };

  return (
    <div>
      <input
        type="text"
        onChange={handleFilterChange}
        placeholder="Filter..."
      />
    </div>
  );
};

export default FilterStats;
