import TextField, {TextFieldProps} from "../TextField/TextField"

type EmailFieldProps = TextFieldProps

export default function EmailField(props: EmailFieldProps) {
    return (
        <TextField
            type="email"
            {...props}
         />
    )
}