import { useState } from 'react'

export const useForm = (initialForm = {}) => {
    const [formState, setFormState] = useState(initialForm);

    // Actualización funcional: dos cambios seguidos (autofill, tipeo rápido) no se pisan entre sí.
    const onInputChange = ({ target }) => {
        const { name, value } = target;
        setFormState((prev) => ({ ...prev, [name]: value }));
    };

    const onResetForm = () => {
        setFormState(initialForm);
    };

    return {
        ...formState,
        formState,
        setFormState,
        onInputChange,
        onResetForm,
    };
};
