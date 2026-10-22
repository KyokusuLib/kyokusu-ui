import { ref, computed, type Ref } from "vue";
import { useKyokusuLocale } from "../i18n";

export interface CalendarDay {
    day: number | null;
    fullDate: string | null;
}

const toISODate = (d: Date): string => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export function useDatepicker(model: Ref<string | undefined>, locale: Ref<string>, type: Ref<"date" | "year">) {
    const viewDate = ref(new Date());
    const viewMode = ref<"days" | "years">("days");
    const isOpen = ref(false);

    const parseDate = (val?: string): Date | null => {
        if (!val) return null;
        if (val.includes(".")) {
            const [d, m, y] = val.split(".");
            return new Date(Number(y), Number(m) - 1, Number(d));
        }
        if (val.includes("-")) {
            const [y, m, d] = val.split("-");
            return new Date(Number(y), Number(m) - 1, Number(d));
        }
        const date = new Date(val);
        return isNaN(date.getTime()) ? null : date;
    };

    const initDate = () => {
        const parsed = parseDate(model.value);
        if (parsed) viewDate.value = parsed;
    };

    const formattedValue = computed(() => {
        if (!model.value) return "";
        
        if (type.value === "year") {
            return model.value;
        }
        
        const date = parseDate(model.value);
        if (!date) return model.value;
        return new Intl.DateTimeFormat(locale.value, {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }).format(date);
    });

    const weekDays = computed(() => {
        const fmt = new Intl.DateTimeFormat(locale.value, { weekday: "short" });
        return Array.from({ length: 7 }, (_, i) => {
            const name = fmt.format(new Date(2024, 0, i + 1));
            return name.charAt(0).toUpperCase() + name.slice(1);
        });
    });

    const currentMonthName = computed(() => {
        const name = new Intl.DateTimeFormat(locale.value, { month: "long" }).format(viewDate.value);
        return name.charAt(0).toUpperCase() + name.slice(1);
    });

    const currentYear = computed(() => viewDate.value.getFullYear());

    const calendarDays = computed<CalendarDay[]>(() => {
        const year = viewDate.value.getFullYear();
        const month = viewDate.value.getMonth();
        const firstDay = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let startDay = firstDay.getDay();
        startDay = startDay === 0 ? 6 : startDay - 1;

        const days: CalendarDay[] = Array.from({ length: startDay }, () => ({ 
            day: null, 
            fullDate: null 
        }));

        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ 
                day: i, 
                fullDate: toISODate(new Date(year, month, i))
            });
        }
        return days;
    });

    const selectedYear = computed(() => {
        if (!model.value) return null;
        if (type.value === "year") {
            return Number(model.value) || null;
        }
        const date = parseDate(model.value);
        return date ? date.getFullYear() : null;
    });

    const availableYears = computed(() => {
        const current = new Date().getFullYear() + 10;
        return Array.from({ length: 150 }, (_, i) => current - i);
    });

    const selectDate = (dateStr: string) => {
        model.value = dateStr;
        isOpen.value = false;
    };

    const selectYear = (year: number) => {
        if (type.value === "year") {
            model.value = String(year);
            isOpen.value = false;
            return;
        }
        viewDate.value = new Date(year, viewDate.value.getMonth(), 1);
        viewMode.value = "days";
    };

    const prevMonth = () => {
        viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() - 1, 1);
    };

    const nextMonth = () => {
        viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + 1, 1);
    };

    const isSelected = (dateStr: string) => {
        const d = parseDate(model.value);
        return d ? toISODate(d) === dateStr : false;
    };

    const isToday = (dateStr: string) => {
        return toISODate(new Date()) === dateStr;
    };

    const { t } = useKyokusuLocale(locale);

    const uiLabels = computed(() => ({
        selectYear: t("selectYear")
    }));

    return {
        isOpen,
        viewMode,
        viewDate,
        formattedValue,
        weekDays,
        currentMonthName,
        currentYear,
        calendarDays,
        availableYears,
        selectedYear,
        uiLabels,
        initDate,
        selectDate,
        selectYear,
        prevMonth,
        nextMonth,
        isSelected,
        isToday
    };
}