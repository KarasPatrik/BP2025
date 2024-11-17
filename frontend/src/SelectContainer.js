import React, { useState } from 'react';
import SelectField from './SelectField';

const SelectContainer = () => {
    const [folder, setFolder] = useState([]);
    const [model, setModel] = useState([]);
    const [stopLoss, setStopLoss] = useState([]);

    return (
        <div style={{ display: 'flex', gap: '20px' }}>
            <SelectField
                label="Folder"
                endpoint="http://localhost:5001/mainFolders"
                value={folder}
                onChange={setFolder}
            />
            <SelectField
                label="Model"
                endpoint="http://localhost:5001/models"
                value={model}
                onChange={setModel}
            />
            <SelectField
                label="Stop Loss"
                endpoint="http://localhost:5001/stoploss"
                value={stopLoss}
                onChange={setStopLoss}
            />
        </div>
    );
};

export default SelectContainer;
