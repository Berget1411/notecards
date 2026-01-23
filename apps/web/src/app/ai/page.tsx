"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Send } from "lucide-react";
import dynamic from "next/dynamic";

const Streamdown = dynamic(
	() => import("streamdown").then((mod) => ({ default: mod.Streamdown })),
	{
		loading: () => (
			<div className="flex h-full items-center justify-center">
				<div className="text-muted-foreground">Loading response...</div>
			</div>
		),
		ssr: false,
	},
);

import { env } from "@notecards/env/web";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AIPage() {
	const [input, setInput] = useState("");
	const { messages, sendMessage, status } = useChat({
		transport: new DefaultChatTransport({
			api: `${env.NEXT_PUBLIC_SERVER_URL}/ai`,
		}),
	});
	const messageCount = messages.length;

	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (messageCount === 0) return;
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messageCount]);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const text = input.trim();
		if (!text) return;
		sendMessage({ text });
		setInput("");
	};

	return (
		<div className="mx-auto grid w-full grid-rows-[1fr_auto] overflow-hidden p-4">
			<div className="space-y-4 overflow-y-auto pb-4">
				{messages.length === 0 ? (
					<div className="mt-8 text-center text-muted-foreground">
						Ask me anything to get started!
					</div>
				) : (
					messages.map((message) => (
						<div
							key={message.id}
							className={`rounded-lg p-3 ${
								message.role === "user"
									? "ml-8 bg-primary/10"
									: "mr-8 bg-secondary/20"
							}`}
						>
							<p className="mb-1 font-semibold text-sm">
								{message.role === "user" ? "You" : "AI Assistant"}
							</p>
							{message.parts?.map((part) => {
								if (part.type === "text") {
									const partKey = `${message.id}-${part.type}-${part.text}`;
									return (
										<Streamdown
											key={partKey}
											isAnimating={
												status === "streaming" && message.role === "assistant"
											}
										>
											{part.text}
										</Streamdown>
									);
								}
								return null;
							})}
						</div>
					))
				)}
				<div ref={messagesEndRef} />
			</div>

			<form
				onSubmit={handleSubmit}
				className="flex w-full items-center space-x-2 border-t pt-2"
			>
				<Input
					name="prompt"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="Type your message..."
					className="flex-1"
					autoComplete="off"
					autoFocus
				/>
				<Button type="submit" size="icon">
					<Send size={18} />
				</Button>
			</form>
		</div>
	);
}
