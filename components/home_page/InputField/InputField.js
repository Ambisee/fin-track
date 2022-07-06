import { useState } from 'react';

import styles from './InputField.module.css'
import VisibilityToggler from './VisibilityToggler';

export default function InputField(props) {
    const { 
        name,
        type,
        value,
        required,
        minLength,
        onChange,
    } = props

    const [currentType, setCurrentType] = useState(type)
    const changeHandler = (e) => {
        onChange(e)
    }

    return (
        <div className={`
                ${styles.fieldContainer}
                swiper-no-swiping
            `}
        >
            <input
                name={name}
                value={value}
                type={currentType}
                minLength={minLength}
                required={required}
                onChange={changeHandler}
                className={`
                    ${styles.field}
                    ${value && styles.filled}
                `}
            />
            <label
                htmlFor={name}
                className={styles.fieldName}
            >
                {name.split('-').join(' ')}
            </label>
            {type === 'password' && 
                <VisibilityToggler 
                    isVisible={currentType === 'text'}
                    toggleOn={() => {setCurrentType('text')}} 
                    toggleOff={() => {setCurrentType('password')}}
                />
            }
        </div>
    )
}
