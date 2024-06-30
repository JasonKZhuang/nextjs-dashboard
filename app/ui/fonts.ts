import {Inter, Lusitana, Roboto_Mono} from 'next/font/google';
import {undefined} from "zod";

export const inter = Inter({ subsets: ['latin'] });
export const roboto_mono = Roboto_Mono({
    subsets: ['latin'],
    display: 'swap',
})
export const lusitana = Lusitana({
    weight: ['400', '700'],
    subsets: ['latin'],
});
