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

const SelectField = ({ label, endpoint, value, onChange, isMulti, dependentData = null }) => {
    const [options, setOptions] = useState([]);
    const [filteredOptions, setFilteredOptions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                if (dependentData && Object.values(dependentData).some((v) => !v || v.length === 0)) {
                    setOptions([]);
                    setFilteredOptions([]);
                    return;
                }

                const response = await axios.post(endpoint, dependentData || {});
                const data = response.data;

                const items = data.map((item) => ({ value: item, label: item }));
                setOptions(items);
                setFilteredOptions(items);
            } catch (error) {
                console.error(`Error fetching options for ${label}:`, error);
            }
        };

        if (endpoint) {
            fetchOptions();
        }
    }, [endpoint, dependentData, label]);

    useEffect(() => {
        const filtered = options.filter((option) =>
            option.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredOptions(filtered);
    }, [searchTerm, options]);

    const handleChange = (event) => {
        const { value } = event.target;

        if (isMulti) {
            if (value.includes('Select All')) {
                if (value.length === options.length + 1) {
                    onChange([]);
                } else {
                    const allOptionValues = options.map((option) => option.value);
                    onChange(allOptionValues);
                }
            } else {
                onChange(value);
            }
        } else {
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
                multiple={isMulti}
                value={value}
                onChange={handleChange}
                renderValue={(selected) =>
                    isMulti
                        ? selected.length === options.length
                            ? 'All Selected'
                            : selected.join(', ')
                        : selected
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
                    if (e.key !== 'Tab') {
                        e.stopPropagation();
                    }
                }}
            >
                {/* Search bar for multiselects */}
                {isMulti && (
                    <MenuItem disabled style={{ pointerEvents: 'auto' }}>
                        <TextField
                            fullWidth
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            size="small"
                            onKeyDown={(e) => {
                                e.stopPropagation();
                            }}
                        />
                    </MenuItem>
                )}

                {/* "Select All" Option for multiselects */}
                {isMulti && (
                    <MenuItem value="Select All">
                        <Checkbox checked={value.length === options.length} />
                        <ListItemText primary="Select All" />
                    </MenuItem>
                )}

                {/* Render filtered options */}
                {filteredOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        {isMulti && <Checkbox checked={value.includes(option.value)} />}
                        <ListItemText primary={option.label} />
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default SelectField;

