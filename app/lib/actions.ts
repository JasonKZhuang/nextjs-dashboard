// mark all the exported functions within the file as Server Actions.
// These server functions can then be imported and used in Client and Server components.
"use server";

import {z} from 'zod';
import {sql} from '@vercel/postgres';
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Please select a customer.',
    }),
    amount: z.coerce // 强制转换为数字同时验证类型
        .number()
        .gt(0, { message: 'Please enter an amount greater than $0.' }),
    status: z.enum(['pending', 'paid'], {
        invalid_type_error: 'Please select an invoice status.',
    }),
    date: z.string(),
});

const CreateInvoice = FormSchema.omit({id: true, date: true});

export type State = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    };
    message?: string | null;
};

export async function createInvoice(prevState:State, argForm: FormData) {
    const rawFormData = {
        customerId: argForm.get('customerId'),
        amount: argForm.get('amount'),
        status: argForm.get('status'),
    };

    // Test it out:
    console.log(rawFormData);
    console.log(typeof rawFormData.customerId);
    console.log(typeof rawFormData.amount);
    console.log(typeof rawFormData.status);

    // Validate form fields using Zod
    // safeParse() will return an object containing either a success or error field.
    const validatedFields = CreateInvoice.safeParse(rawFormData);

    console.log(validatedFields);

    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice.',
        };
    }

    // Prepare data for insertion into the database
    const { customerId, amount, status } = validatedFields.data;

    // It's usually good practice to store monetary values in cents in your database
    // to eliminate JavaScript floating-point errors and ensure greater accuracy.
    const amountInCents = amount * 100;

    // create a new date with the format "YYYY-MM-DD" for the invoice's creation date
    const date = new Date().toLocaleString().split('T')[0];

    try {
        // Insert the new invoice into the database
        await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
    } catch (error) {
        return {
            message: 'Database Error: Failed to Create Invoice.'
        }
    }

    //  to clear this cache and trigger a new request to the server.
    revalidatePath('/dashboard/invoices');

    // to redirect the user back to the /dashboard/invoices page
    redirect('/dashboard/invoices');
}

const UpdateInvoice = FormSchema.omit({id: true, date: true});

export async function updateInvoice(id: string, prevState: State, argForm: FormData) {

    const rawFormData = {
        customerId: argForm.get('customerId'),
        amount: argForm.get('amount'),
        status: argForm.get('status'),
    };

    const validatedFields = UpdateInvoice.safeParse(rawFormData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Update Invoice.',
        };
    }

    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;

    try {
        await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
    `;
    } catch (error) {
        return {
            message: 'Database Error: Failed to Update Invoice.'
        };
    }

    revalidatePath('/dashboard/invoices');

    redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
    throw new Error('Failed to Delete Invoice');

    try {
        await sql`DELETE FROM invoices WHERE id = ${id}`;
        revalidatePath('/dashboard/invoices');
    } catch (error) {
        return {message: 'Database Error: Failed to Delete Invoice.'};
    }
}