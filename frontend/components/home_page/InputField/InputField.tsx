import { InputHTMLAttributes, useState } from 'react';

import styles from './InputField.module.css'
import VisibilityToggler from './VisibilityToggler';

/**
 * The input field component used in all of the forms in.
 * 
 * @param props The properties that will be passed down to the component 
 * @param props.id The `id` property of the input field
 * @param props.name The name that corresponds to the internal <input> element 
 * @param props.type The type of the internal <input> element.
 *      Supported types: `text`, `password`, `email`
 * @param props.value The value of the internal <input> element. To be used to
 *      connect the <input> field and a React state
 * @param props.required The `required` constraint of the <input> elemenat
 * @param props.minLength The `minLength` constraint of the <input> element
 * @param props.onChange The callback function that triggers when the value in the <input> changes
 * @returns 
 */
export default function InputField(props: InputHTMLAttributes<HTMLInputElement>) {
    const { 
        id,
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
                id={id}
                name={name}
                value={value}
                type={currentType}
                minLength={minLength}
                required={required}
                spellCheck={false}
                onChange={(e) => onChange(e)}
                className={`
                    ${styles.field}
                    ${value && styles.filled}
                `}
            />
            <label
                htmlFor={id}
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
