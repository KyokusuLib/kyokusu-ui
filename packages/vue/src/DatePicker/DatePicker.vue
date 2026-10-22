<script lang="ts" setup>
import { nextTick, onMounted, onUnmounted, ref, computed, useId, useAttrs } from "vue";
import { PhCalendarBlank, PhCaretLeft, PhCaretRight } from "@phosphor-icons/vue";
import { useDatepicker } from "./useDatepicker";
import { useKyokusuLocale } from "../i18n";

defineOptions({ inheritAttrs: false });

interface Props {
    id?: string;
    label?: string;
    disabled?: boolean;
    placeholder?: string;
    locale?: string;
    error?: string;
    type?: "date" | "year";
}

const props = withDefaults(defineProps<Props>(), {
    locale: "ru-RU",
    type: "date"
});

const model = defineModel<string>({ default: "" });
const datepickerId = props.id || useId();
const attrs = useAttrs();

const containerRef = ref<HTMLElement | null>(null);
const yearListRef = ref<HTMLElement | null>(null);

const localeRef = computed(() => props.locale);
const { t } = useKyokusuLocale(localeRef);

const typeRef = computed(() => props.type);

const {
    isOpen,
    viewMode,
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
} = useDatepicker(model, localeRef, typeRef);

const wrapperClass = computed(() => attrs.class as any);
const wrapperStyle = computed(() => attrs.style as any);

const inputAttrs = computed(() => {
    const { class: _, style: __, ...rest } = attrs;
    return rest;
});

const handleClickOutside = (event: MouseEvent) => {
    if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
        isOpen.value = false;
        viewMode.value = "days";
    }
};

const toggleCalendar = () => {
    if (props.disabled) return;
    isOpen.value = !isOpen.value;
    viewMode.value = props.type === "year" ? "years" : "days";
    if (isOpen.value) initDate();
};

const switchToYearMode = async () => {
    viewMode.value = "years";
    await nextTick();
    if (yearListRef.value) {
        const selectedEl = yearListRef.value.querySelector(".k-datepicker-year--selected");
        if (selectedEl) selectedEl?.scrollIntoView?.({ block: "center" });
    }
};

onMounted(() => {
    initDate();
    document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
    <div class="k-datepicker-wrapper" :class="wrapperClass" :style="wrapperStyle" ref="containerRef">
        <label v-if="label" :for="datepickerId" class="k-datepicker-label">
            {{ label }}
        </label>
        
        <div class="k-datepicker-trigger">
            <input 
                v-bind="inputAttrs"
                :id="datepickerId"
                type="text"
                readonly
                :disabled="disabled"
                :value="formattedValue"
                @click="toggleCalendar"
                class="k-datepicker-input"
                :class="{ 
                    'k-datepicker-input--disabled': disabled,
                    'k-datepicker-input--error': error
                }"
                :placeholder="placeholder || t('datePlaceholder')"
            />
            <div class="k-datepicker-icon">
                <PhCalendarBlank :size="18" />
            </div>
        </div>

        <p v-if="error" class="k-datepicker-error-text">{{ error }}</p>

        <transition name="k-datepicker-fade">
            <div v-if="isOpen && !disabled" class="k-datepicker-popup">
                <div class="k-datepicker-mobile-drag"></div>
                
                <div v-if="type !== 'year'" class="k-datepicker-header">
                    <button 
                        v-if="viewMode === 'days'"
                        @click.prevent="prevMonth"
                        class="k-datepicker-nav-btn"
                    >
                        <PhCaretLeft :size="16" weight="bold" />
                    </button>
                    <div v-else class="k-datepicker-spacer"></div> 
                    
                    <div class="k-datepicker-title">
                        <span class="k-datepicker-month">
                            {{ viewMode === 'days' ? currentMonthName : uiLabels.selectYear }}
                        </span>
                        <button 
                            @click.prevent="viewMode === 'days' ? switchToYearMode() : viewMode = 'days'"
                            class="k-datepicker-year-toggle"
                        >
                            {{ currentYear }}
                        </button>
                    </div>
                    
                    <button 
                        v-if="viewMode === 'days'"
                        @click.prevent="nextMonth"
                        class="k-datepicker-nav-btn"
                    >
                        <PhCaretRight :size="16" weight="bold" />
                    </button>
                    <div v-else class="k-datepicker-spacer"></div>
                </div>

                <div v-if="type === 'year' || viewMode === 'days'" class="k-datepicker-body">
                    <div v-if="type !== 'year'" class="k-datepicker-weekdays">
                        <div v-for="day in weekDays" :key="day" class="k-datepicker-weekday">
                            {{ day }}
                        </div>
                    </div>

                    <div :class="type === 'year' ? 'k-datepicker-years' : 'k-datepicker-grid'">
                        <template v-if="type === 'year'" v-for="year in availableYears" :key="year">
                            <button 
                                @click.prevent="selectYear(year)"
                                class="k-datepicker-year"
                                :class="{ 'k-datepicker-year--selected': year === selectedYear }"
                            >
                                {{ year }}
                            </button>
                        </template>
                        <template v-else v-for="(dayObj, index) in calendarDays" :key="index">
                            <div v-if="!dayObj.day" class="k-datepicker-empty"></div>
                            
                            <button 
                                v-else
                                @click.prevent="selectDate(dayObj.fullDate!)"
                                class="k-datepicker-day"
                                :class="{
                                    'k-datepicker-day--selected': isSelected(dayObj.fullDate!),
                                    'k-datepicker-day--today': isToday(dayObj.fullDate!) && !isSelected(dayObj.fullDate!)
                                }"
                            >
                                {{ dayObj.day }}
                            </button>
                        </template>
                    </div>
                </div>

                <div v-else ref="yearListRef" class="k-datepicker-years">
                    <button 
                        v-for="year in availableYears" 
                        :key="year"
                        @click.prevent="selectYear(year)"
                        class="k-datepicker-year"
                        :class="{ 'k-datepicker-year--selected': year === selectedYear }"
                    >
                        {{ year }}
                    </button>
                </div>
            </div>
        </transition>
    </div>
</template>

<style scoped>
.k-datepicker-wrapper {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
    position: relative;

    --k-dp-bg: var(--k-white);
    --k-dp-border: var(--k-zinc-200);
    --k-dp-border-focus: var(--k-zinc-900);
    --k-dp-ring: rgba(24, 24, 27, 0.1);
    --k-dp-text: var(--k-zinc-900);
    --k-dp-placeholder: var(--k-zinc-400);
    --k-dp-label: var(--k-zinc-900);
    --k-dp-icon: var(--k-zinc-500);
    --k-dp-disabled-bg: var(--k-zinc-100);
    --k-dp-error: var(--k-red-500);
    --k-dp-error-ring: rgba(239, 68, 68, 0.1);
    
    --k-dp-popup-bg: var(--k-white);
    --k-dp-popup-border: var(--k-zinc-200);
    --k-dp-popup-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
    
    --k-dp-hover-bg: var(--k-zinc-100);
    --k-dp-selected-bg: var(--k-zinc-900);
    --k-dp-selected-text: var(--k-white);
    --k-dp-today-border: var(--k-zinc-200);
}

.dark .k-datepicker-wrapper {
    --k-dp-bg: var(--k-zinc-900);
    --k-dp-border: var(--k-zinc-700);
    --k-dp-border-focus: var(--k-white);
    --k-dp-ring: rgba(255, 255, 255, 0.1);
    --k-dp-text: var(--k-zinc-100);
    --k-dp-placeholder: var(--k-zinc-500);
    --k-dp-label: var(--k-zinc-100);
    --k-dp-icon: var(--k-zinc-400);
    --k-dp-disabled-bg: var(--k-zinc-800);
    
    --k-dp-popup-bg: var(--k-zinc-900);
    --k-dp-popup-border: var(--k-zinc-700);
    --k-dp-popup-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
    
    --k-dp-hover-bg: var(--k-zinc-800);
    --k-dp-selected-bg: var(--k-white);
    --k-dp-selected-text: var(--k-zinc-900);
    --k-dp-today-border: var(--k-zinc-700);
}

.k-datepicker-label {
    font-size: 14px;
    font-weight: 500;
    color: var(--k-dp-label);
    margin-left: 2px;
}

.k-datepicker-trigger {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
}

.k-datepicker-input {
    width: 100%;
    background-color: var(--k-dp-bg);
    border: 1px solid var(--k-dp-border);
    border-radius: 8px;
    padding: 10px 38px 10px 14px;
    font-family: inherit;
    font-size: 14px;
    color: var(--k-dp-text);
    outline: none;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.k-datepicker-input::placeholder {
    color: var(--k-dp-placeholder);
}

.k-datepicker-input:focus {
    border-color: var(--k-dp-border-focus);
    box-shadow: 0 0 0 4px var(--k-dp-ring);
}

.k-datepicker-input--error {
    border-color: var(--k-dp-error) !important;
}

.k-datepicker-input--error:focus {
    box-shadow: 0 0 0 4px var(--k-dp-error-ring) !important;
}

.k-datepicker-input--disabled {
    background-color: var(--k-dp-disabled-bg);
    opacity: 0.6;
    cursor: not-allowed;
}

.k-datepicker-icon {
    position: absolute;
    right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--k-dp-icon);
    pointer-events: none;
}

.k-datepicker-error-text {
    font-size: 12px;
    font-weight: 500;
    color: var(--k-dp-error);
    margin-left: 2px;
}

.k-datepicker-popup {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    z-index: var(--k-z-dropdown);
    width: 280px;
    background-color: var(--k-dp-popup-bg);
    border: 1px solid var(--k-dp-popup-border);
    border-radius: 12px;
    box-shadow: var(--k-dp-popup-shadow);
    padding: 16px;
    overflow: hidden;
}

.k-datepicker-mobile-drag {
    display: none;
}

.k-datepicker-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
}

.k-datepicker-nav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    border: none;
    background: transparent;
    color: var(--k-dp-icon);
    cursor: pointer;
    transition: all 0.2s ease;
}

.k-datepicker-nav-btn:hover {
    background-color: var(--k-dp-hover-bg);
    color: var(--k-dp-text);
}

.k-datepicker-spacer {
    width: 28px;
}

.k-datepicker-title {
    display: flex;
    align-items: center;
    gap: 4px;
}

.k-datepicker-month {
    font-size: 14px;
    font-weight: 500;
    color: var(--k-dp-text);
}

.k-datepicker-year-toggle {
    font-size: 14px;
    font-weight: 700;
    color: var(--k-dp-text);
    background: transparent;
    border: none;
    border-radius: 4px;
    padding: 2px 6px;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.k-datepicker-year-toggle:hover {
    background-color: var(--k-dp-hover-bg);
}

.k-datepicker-weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    margin-bottom: 8px;
}

.k-datepicker-weekday {
    text-align: center;
    font-size: 12px;
    font-weight: 500;
    color: var(--k-dp-icon);
}

.k-datepicker-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
}

.k-datepicker-day {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    width: 100%;
    border-radius: 6px;
    border: 1px solid transparent;
    background: transparent;
    font-size: 13px;
    color: var(--k-dp-text);
    cursor: pointer;
    transition: all 0.15s ease;
}

.k-datepicker-day:hover:not(.k-datepicker-day--selected) {
    background-color: var(--k-dp-hover-bg);
}

.k-datepicker-day--selected {
    background-color: var(--k-dp-selected-bg);
    color: var(--k-dp-selected-text);
    font-weight: 600;
}

.k-datepicker-day--today {
    border-color: var(--k-dp-today-border);
}

.k-datepicker-years {
    height: 220px;
    overflow-y: auto;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    padding-right: 4px;
}

.k-datepicker-years::-webkit-scrollbar {
    width: 4px;
}

.k-datepicker-years::-webkit-scrollbar-track {
    background: transparent;
}

.k-datepicker-years::-webkit-scrollbar-thumb {
    background-color: var(--k-dp-border);
    border-radius: 4px;
}

.k-datepicker-year {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 0;
    border-radius: 6px;
    border: none;
    background: transparent;
    font-size: 13px;
    color: var(--k-dp-text);
    cursor: pointer;
    transition: all 0.15s ease;
}

.k-datepicker-year:hover:not(.k-datepicker-year--selected) {
    background-color: var(--k-dp-hover-bg);
}

.k-datepicker-year--selected {
    background-color: var(--k-dp-selected-bg);
    color: var(--k-dp-selected-text);
    font-weight: 600;
}

.k-datepicker-fade-enter-active,
.k-datepicker-fade-leave-active {
    transition: opacity 0.15s ease, transform 0.15s ease;
}

.k-datepicker-fade-enter-from,
.k-datepicker-fade-leave-to {
    opacity: 0;
    transform: translateY(-4px) scale(0.98);
}

@media (max-width: 639px) {
    .k-datepicker-popup {
        position: fixed;
        top: auto;
        bottom: 0;
        left: 0;
        width: 100vw;
        border-radius: 20px 20px 0 0;
        padding: 24px 16px env(safe-area-inset-bottom, 24px);
        box-shadow: 0 -10px 25px -5px rgba(0, 0, 0, 0.2);
    }
    
    .k-datepicker-mobile-drag {
        display: block;
        width: 40px;
        height: 4px;
        background-color: var(--k-dp-border);
        border-radius: 2px;
        margin: -8px auto 16px;
    }

    .k-datepicker-fade-enter-from,
    .k-datepicker-fade-leave-to {
        transform: translateY(100%);
    }
}
</style>