"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface Props {
    categories: { id: string; name: string }[];
    cities: { id: string; name: string }[];
    currentSearch: string;
    currentStatus: string;
    currentCategory: string;
    currentCity: string;
}

// 1. Define the Filter type outside the component or function
type FilterState = {
    search: string;
    status: string;
    category: string;
    city: string;
};

export default function AdminReportsFilter({
    categories,
    cities,
    currentSearch,
    currentStatus,
    currentCategory,
    currentCity,
}: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [search, setSearch] = useState(currentSearch);
    const [status, setStatus] = useState(currentStatus);
    const [category, setCategory] = useState(currentCategory);
    const [city, setCity] = useState(currentCity);

    const applyFilters = (overrides?: Partial<FilterState>) => {
        const filters: FilterState = { search, status, category, city, ...overrides };

        const params = new URLSearchParams();
        if (filters.search) params.set("search", filters.search);
        if (filters.status) params.set("status", filters.status);
        if (filters.category) params.set("category", filters.category);
        if (filters.city) params.set("city", filters.city);

        startTransition(() => {
            router.push(`/admin/reports?${params.toString()}`);
        });
    };

    const clearFilters = () => {
        setSearch("");
        setStatus("");
        setCategory("");
        setCity("");
        startTransition(() => router.push("/admin/reports"));
    };

    const hasFilters = search || status || category || city;

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5">
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                    <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-navy/35" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                        placeholder="Cari judul laporan..."
                        className="input-field pl-9 w-full text-sm"
                    />
                </div>

                {/* Status */}
                <select
                    value={status}
                    onChange={(e) => { setStatus(e.target.value); applyFilters({ status: e.target.value }); }}
                    className="input-field text-sm w-full sm:w-40"
                >
                    <option value="">Semua Status</option>
                    <option value="pending">Menunggu</option>
                    <option value="diproses">Diproses</option>
                    <option value="selesai">Selesai</option>
                    <option value="ditolak">Ditolak</option>
                </select>

                {/* Kategori */}
                <select
                    value={category}
                    onChange={(e) => { setCategory(e.target.value); applyFilters({ category: e.target.value }); }}
                    className="input-field text-sm w-full sm:w-48"
                >
                    <option value="">Semua Kategori</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>

                {/* Kota */}
                <select
                    value={city}
                    onChange={(e) => { setCity(e.target.value); applyFilters({ city: e.target.value }); }}
                    className="input-field text-sm w-full sm:w-44"
                >
                    <option value="">Semua Kota</option>
                    {cities.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>

                {/* Tombol Search */}
                <button
                    onClick={() => applyFilters()}
                    disabled={isPending}
                    className="bg-blue text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-hover transition-colors whitespace-nowrap disabled:opacity-60"
                >
                    {isPending ? "..." : "Cari"}
                </button>
            </div>

            {/* Active filters + reset */}
            {hasFilters && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2 flex-wrap">
                        {search && <span className="text-xs bg-navy/5 text-navy/60 px-2 py-0.5 rounded-full">"{search}"</span>}
                        {status && <span className="text-xs bg-navy/5 text-navy/60 px-2 py-0.5 rounded-full">{status}</span>}
                        {category && <span className="text-xs bg-navy/5 text-navy/60 px-2 py-0.5 rounded-full">{categories.find(c => c.id === category)?.name}</span>}
                        {city && <span className="text-xs bg-navy/5 text-navy/60 px-2 py-0.5 rounded-full">{cities.find(c => c.id === city)?.name}</span>}
                    </div>
                    <button
                        onClick={clearFilters}
                        className="text-xs text-blue font-semibold hover:underline shrink-0"
                    >
                        Reset filter
                    </button>
                </div>
            )}
        </div>
    );
}