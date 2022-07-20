/**
 * components/home_page/InputField/InputField.js
 * 
 * The input field component used in all of the forms in.
 */
import { useState } from 'react';

import styles from './InputField.module.css'
import VisibilityToggler from './VisibilityToggler';

export default function InputField(props) {
    /**
     * name: String =
     *      The name that corresponds to the internal <input> element 
     * type: String =
     *      The type of the internal <input> element.
     *      Supported types: `text`, `password`, `email`
     * value: ~ =
     *      The value of the internal <input> element. To be used to
     *      connect the <input> field and a React state
     * required: Boolean =
     *      The `required` constraint of the <input> elemenat
     * minLength: Number =
     *      The `minLength` constraint of the <input> element
     * onChange: Function =
     *      The callback function that triggers when the value in the <input> changes
     */
    const { 
        name,
        type,
        value,
        required,
        minLength,
        onChange,
    } = props

    /**
     * currentType: String =
     *      The `type` attribute of the <input> field. Only used
     *      when the initial `type` of the component is `password`
     */
    const [currentType, setCurrentType] = useState(type)

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
                onChange={(e) => onChange(e)}
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
