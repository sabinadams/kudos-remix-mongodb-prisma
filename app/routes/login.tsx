// login.tsx
import { useState, useEffect, useRef } from 'react'
import { Layout } from '~/components/layout'
import { FormField } from '~/components/form-field'
import { validateEmail, validateName, validatePassword } from '~/utils/validators.server'
import { ActionFunction, json, LoaderFunction, redirect } from '@remix-run/node'
import { login, register, getUser } from '~/utils/auth.server'
import { useActionData } from '@remix-run/react'

export const loader: LoaderFunction = async ({ request }) => {
    // If there's already a user in the session, redirect to the home page
    return await getUser(request) ? redirect('/') : null
}

export const action: ActionFunction = async ({ request }) => {
    const form = await request.formData();
    const action = form.get("_action");
    const email = form.get("email");
    const password = form.get("password");
    let firstName = form.get("firstName");
    let lastName = form.get("lastName");

    // If not all data was passed, error
    if (
        typeof action !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string"
    ) {
        return json({ error: `Invalid Form Data`, form: action }, { status: 400 });
    }

    // If not all data was passed, error
    if (
        action === 'register' && (
            typeof firstName !== "string" ||
            typeof lastName !== "string"
        )
    ) {
        return json({ error: `Invalid Form Data`, form: action }, { status: 400 });
    }

    // Validate email & password
    const errors = {
        email: validateEmail(email),
        password: validatePassword(password),
        ...(action === 'register' ? {
            firstName: validateName(firstName as string || ''),
            lastName: validateName(lastName as string || ''),
        } : {})
    };

    //  If there were any errors, return them
    if (Object.values(errors).some(Boolean))
        return json({ errors, fields: { email, password, firstName, lastName }, form: action }, { status: 400 });

    switch (action) {
        case 'login': {
            return await login({ email, password })
        }
        case 'register': {
            firstName = firstName as string
            lastName = lastName as string
            return await register({ email, password, firstName, lastName })
        }
        default:
            return json({ error: `Invalid Form Data` }, { status: 400 });
    }
}

export default function Login() {
    const actionData = useActionData()
    const firstLoad = useRef(true)
    const [action, setAction] = useState('login')
    const [errors, setErrors] = useState(actionData?.errors || {})
    const [formError, setFormError] = useState(actionData?.error || '')
    const [formData, setFormData] = useState({
        email: actionData?.fields?.email || '',
        password: actionData?.fields?.password || '',
        firstName: actionData?.fields?.lastName || '',
        lastName: actionData?.fields?.firstName || '',
    })

    // Updates the form data when an input changes
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
        setFormData(form => ({ ...form, [field]: event.target.value }))
    }

    useEffect(() => {
        // Clear the form if we switch forms
        if (!firstLoad.current) {
            const newState = {
                email: '',
                password: '',
                firstName: '',
                lastName: ''
            }
            setErrors(newState)
            setFormError('')
            setFormData(newState)
        }
    }, [action])

    useEffect(() => {
        if (!firstLoad.current) {
            setFormError('')
        }
    }, [formData])

    useEffect(() => {
        // We don't want to reset errors on page load because we want to see them
        firstLoad.current = false
    }, [])

    return (
        <Layout>
            <div className="h-full justify-center items-center flex flex-col gap-y-4">
                {/* Form Switcher Button */}
                <button
                    onClick={() => setAction(action == 'login' ? 'register' : 'login')}
                    className="absolute top-8 right-8 rounded-xl bg-yellow-300 font-semibold text-blue-600 px-3 py-2 transition duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1"
                >{action === 'login' ? 'Sign Up' : 'Sign In'}</button>

                <h2 className="text-5xl font-extrabold text-yellow-300">Welcome to Kudos!</h2>
                <p className="font-semibold text-slate-300">{
                    action === 'login' ? 'Log In To Give Some Praise!' : 'Sign Up To Get Started!'
                }</p>
                <form method="POST" className="rounded-2xl bg-gray-200 p-6 w-96">
                    <div className="text-xs font-semibold text-center tracking-wide text-red-500 w-full">
                        {formError}
                    </div>
                    <FormField
                        htmlFor="email"
                        label="Email"
                        value={formData.email}
                        onChange={e => handleInputChange(e, 'email')}
                        error={errors?.email}
                    />
                    <FormField
                        htmlFor="password"
                        type="password"
                        label="Password"
                        value={formData.password}
                        onChange={e => handleInputChange(e, 'password')}
                        error={errors?.password}
                    />

                    {
                        action === 'register' && <>
                            {/* First Name */}
                            <FormField htmlFor="firstName" label='First Name' onChange={e => handleInputChange(e, 'firstName')} value={formData.firstName} error={errors?.firstName} />
                            {/* Last Name */}
                            <FormField htmlFor="lastName" label='Last Name' onChange={e => handleInputChange(e, 'lastName')} value={formData.lastName} error={errors?.lastName} />
                        </>
                    }

                    <div className="w-full text-center">
                        <button type="submit" name="_action" value={action} className="rounded-xl mt-2 bg-yellow-300 px-3 py-2 text-blue-600 font-semibold transition duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1">
                            {
                                action === 'login' ? "Sign In" : "Sign Up"
                            }
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    )
}