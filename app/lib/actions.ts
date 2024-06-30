// mark all the exported functions within the file as Server Actions.
// These server functions can then be imported and used in Client and Server components.
"use server";

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(), // 强制转换为数字同时验证类型
    status: z.enum(['pending', 'paid']),
    date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
export async function createInvoice(argForm: FormData){
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

    const { customerId, amount, status } = CreateInvoice.parse(rawFormData);

    // It's usually good practice to store monetary values in cents in your database
    // to eliminate JavaScript floating-point errors and ensure greater accuracy.
    const amountInCents = amount * 100;

    // create a new date with the format "YYYY-MM-DD" for the invoice's creation date
    const date = new Date().toLocaleString().split('T')[0];

    // Insert the new invoice into the database
    await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;

    //  to clear this cache and trigger a new request to the server.
    revalidatePath('/dashboard/invoices');

    // to redirect the user back to the /dashboard/invoices page
    redirect('/dashboard/invoices');
}

const UpdateInvoice = FormSchema.omit({ id: true, date: true });
export async function updateInvoice(id:string, argForm: FormData){

    const rawFormData = {
        customerId: argForm.get('customerId'),
        amount: argForm.get('amount'),
        status: argForm.get('status'),
    };

    const { customerId, amount, status } = UpdateInvoice.parse(rawFormData);

    const amountInCents = amount * 100;

    await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
    `;

    revalidatePath('/dashboard/invoices');

    redirect('/dashboard/invoices');
}

export async function deleteInvoice(id:string){
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
}