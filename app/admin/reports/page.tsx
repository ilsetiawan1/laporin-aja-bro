import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { getReports, getReportsCount } from "@/lib/repositories/reportRepository";
import { getCategories, getCities } from "@/lib/actions/locations";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminReportsFilter from "@/components/admin/AdminReportsFilter";
import ReportsTable from "@/components/admin/ReportsTable";
import PaginationBar from "@/components/admin/PaginationBar";

export const metadata = { title: "Kelola Laporan – Admin" };

const PAGE_SIZE = 20;

interface Props {
  searchParams: Promise<{
    search?: string;
    status?: string;
    category?: string;
    city?: string;
    sort?: string;
    order?: string;
    page?: string;
  }>;
}

export default async function AdminReportsPage({ 
  searchParams }: Props) {
  
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/?modal=login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();
  if (!profile || profile.role !== "admin") redirect("/");

  const { search, status, category, city, sort, order, page } =
    await searchParams;

  // Validate sort column
  const validSort = sort === "priority_score" ? "priority_score" : "created_at";
  const validOrder = order === "asc" ? "asc" : "desc";
  const currentPage = Math.max(1, parseInt(page ?? "1", 10));
  const offset = (currentPage - 1) * PAGE_SIZE;

  const filters = {
    search: search || undefined,
    status: status || undefined,
    category: category || undefined,
    city: city || undefined,
  } as const;

  // Parallel fetch: paginated data + total count + dropdowns
  const [reports, totalCount, categories, cities] = await Promise.all([
    getReports(supabase, {
      ...filters,
      sort: validSort,
      order: validOrder,
      limit: PAGE_SIZE,
      offset,
    }),
    getReportsCount(supabase, filters),
    getCategories(),
    getCities(),
  ]);

  // Build a plain serialisable Record for child Client Components
  const rawSearchParams: Record<string, string> = {};
  if (search) rawSearchParams.search = search;
  if (status) rawSearchParams.status = status;
  if (category) rawSearchParams.category = category;
  if (city) rawSearchParams.city = city;
  if (validSort) rawSearchParams.sort = validSort;
  if (validOrder) rawSearchParams.order = validOrder;
  if (currentPage > 1) rawSearchParams.page = String(currentPage);

  return (
    <div className="min-h-screen bg-bg flex">
      <AdminSidebar fullName={profile.full_name ?? user.email ?? "Admin"} />

      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-navy">
                Kelola Laporan
              </h1>
              <p className="text-navy/45 text-sm mt-1">
                {totalCount} laporan ditemukan
                {currentPage > 1 && ` · Halaman ${currentPage}`}
              </p>
            </div>
          </div>

          {/* Filter — key forces remount when URL filter params change */}
          <AdminReportsFilter
            key={`${search ?? ""}-${status ?? ""}-${category ?? ""}-${city ?? ""}`}
            categories={categories}
            cities={cities}
            currentSearch={search ?? ""}
            currentStatus={status ?? ""}
            currentCategory={category ?? ""}
            currentCity={city ?? ""}
            currentSort={validSort}
            currentOrder={validOrder}
          />

          {/* Table card */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <ReportsTable
              reports={reports}
              currentSort={validSort}
              currentOrder={validOrder}
              searchParams={rawSearchParams}
            />

            {/* Pagination */}
            <PaginationBar
              currentPage={currentPage}
              totalCount={totalCount}
              pageSize={PAGE_SIZE}
              searchParams={rawSearchParams}
            />
          </div>
        </div>
      </main>
    </div>
  );
}