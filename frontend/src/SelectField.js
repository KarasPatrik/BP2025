import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    ListItemText,
    TextField,
} from '@mui/material';

const SelectField = ({ label, endpoint, value, onChange }) => {
    const [options, setOptions] = useState([]);
    const [filteredOptions, setFilteredOptions] = useState([]);
    const [selectedValues, setSelectedValues] = useState([]);
    const [searchTerm, setSearchTerm] = useState(''); // Search term for filtering

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const response = await axios.get(endpoint);
                const data = response.data;

                const items = data.map((item) => ({ value: item, label: item }));
                setOptions(items);
                setFilteredOptions(items); // Initialize filtered options
            } catch (error) {
                console.error(`Error fetching options for ${label}:`, error);
            }
        };

        fetchOptions();
    }, [endpoint, label]);

    // Filter options based on the search term
    useEffect(() => {
        const filtered = options.filter((option) =>
            option.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredOptions(filtered);
    }, [searchTerm, options]);

    const handleChange = (event) => {
        const { value } = event.target;

        if (value.includes('Select All')) {
            if (selectedValues.length === options.length) {
                setSelectedValues([]);
                onChange([]);
            } else {
                const allOptionValues = options.map((option) => option.value);
                setSelectedValues(allOptionValues);
                onChange(allOptionValues);
            }
        } else {
            setSelectedValues(value);
            onChange(value);
        }
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    return (
        <FormControl fullWidth>
            <InputLabel>{label}</InputLabel>
            <Select
                multiple
                value={selectedValues}
                onChange={handleChange}
                renderValue={(selected) =>
                    selected.length === options.length
                        ? 'All Selected'
                        : selected.join(', ')
                }
                MenuProps={{
                    PaperProps: {
                        style: {
                            maxHeight: 300,
                            width: 300,
                        },
                    },
                }}
                onKeyDown={(e) => {
                    // Prevent Select component's default keyboard navigation
                    if (e.key !== 'Tab') {
                        e.stopPropagation();
                    }
                }}
            >
                {/* Search bar */}
                <MenuItem disabled style={{ pointerEvents: 'auto' }}>
                    <TextField
                        fullWidth
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        size="small"
                        onKeyDown={(e) => {
                            // Ensure TextField receives the input properly
                            e.stopPropagation();
                        }}
                    />
                </MenuItem>

                {/* "Select All" Option */}
                <MenuItem value="Select All">
                    <Checkbox checked={selectedValues.length === options.length} />
                    <ListItemText primary="Select All" />
                </MenuItem>

                {/* Render filtered options */}
                {filteredOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        <Checkbox checked={selectedValues.includes(option.value)} />
                        <ListItemText primary={option.label} />
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default SelectField;
