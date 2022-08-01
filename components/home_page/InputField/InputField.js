/**
 * components/home_page/InputField/InputField.js
 * 
 */
import { useState } from 'react';

import styles from './InputField.module.css'
import VisibilityToggler from './VisibilityToggler';

/**
 * The input field component used in all of the forms in.
 * 
 * @param {Object} props 
 *      The properties that will be passed down to the component 
 * @param {String} props.name
 *      The name that corresponds to the internal <input> element 
 * @param {String} props.type
 *      The type of the internal <input> element.
 *      Supported types: `text`, `password`, `email`
 * @param {String | Number} props.value
 *      The value of the internal <input> element. To be used to
 *      connect the <input> field and a React state
 * @param {Boolean} props.required
 *      The `required` constraint of the <input> elemenat
 * @param {Number} props.minLength
 *      The `minLength` constraint of the <input> element
 * @param {Function} props.onChange
 *      The callback function that triggers when the value in the <input> changes
 * @returns 
 */
export default function InputField(props) {
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
