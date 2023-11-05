'use client';

import LocalTable from "@/components/table";
import { title, subtitle } from "@/components/primitives";

export default function Home() {
	return (
		<section className="flex flex-col items-center justify-center gap-4">
			<div className="inline-block min-w-full text-center justify-center">
				<h1 className={title()}>&nbsp;</h1>
				<h1 className={title({ color: "red" })}>Claims&nbsp;</h1>
				<h1 className={title()}>
					Dashboard
				</h1>
				<h2 className={subtitle({ class: "mt-4" })}>
					Showing claims for all users
				</h2>
				<LocalTable/>


			</div>

			
		</section>
	);
}
