import '../styles/button.css';

export interface ButtonOptions {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    glow?: boolean;
    block?: boolean;
    disabled?: boolean;
    loading?: boolean;
    text?: string;
    icon?: string | HTMLElement; // SVG string or DOM element
    onClick?: (e: MouseEvent) => void;
}

export class Button {
    private element: HTMLButtonElement;
    private options: ButtonOptions;
    private contentWrapper!: HTMLSpanElement;
    private loaderEl?: HTMLSpanElement;
    private iconEl?: HTMLSpanElement;

    private readonly handleClick = (e: MouseEvent) => {
        if (this.options.disabled || this.options.loading) {
            e.preventDefault();
            return;
        }
        this.options.onClick?.(e);
    };

    constructor(element: HTMLButtonElement | string, options: ButtonOptions = {}) {
        const target = typeof element === 'string' ? document.querySelector(element) : element;
        if (!target) {
            // Support programmatic creation if target not found/provided as string
            this.element = document.createElement('button');
        } else {
            this.element = target as HTMLButtonElement;
        }

        this.options = {
            variant: 'primary',
            size: 'md',
            ...options
        };

        this.mount();
    }

    private mount() {
        this.element.innerHTML = '';
        this.element.type = this.element.type || 'button';
        
        this.updateClasses();

        // Create loader
        this.loaderEl = document.createElement('span');
        this.loaderEl.className = 'k-button-loader';
        this.loaderEl.style.display = this.options.loading ? 'inline-block' : 'none';
        this.element.appendChild(this.loaderEl);

        // Create icon wrapper if needed
        if (this.options.icon) {
            this.iconEl = document.createElement('span');
            this.iconEl.className = 'k-button-icon';
            if (typeof this.options.icon === 'string') {
                this.iconEl.innerHTML = this.options.icon;
            } else {
                this.iconEl.appendChild(this.options.icon);
            }
            this.element.appendChild(this.iconEl);
        }

        // Create text content
        this.contentWrapper = document.createElement('span');
        this.contentWrapper.className = 'k-button-content';
        this.contentWrapper.textContent = this.options.text || '';
        if (this.options.size === 'icon') {
            this.contentWrapper.style.display = 'none'; // hide text in icon mode
        }
        this.element.appendChild(this.contentWrapper);

        // Attributes
        this.element.disabled = !!this.options.disabled || !!this.options.loading;

        // Event listener
        this.element.addEventListener('click', this.handleClick);
    }

    private updateClasses() {
        this.element.className = 'k-button';
        
        if (this.options.variant && this.options.variant !== 'primary') {
            this.element.classList.add(`k-button--${this.options.variant}`);
        }
        if (this.options.size) {
            this.element.classList.add(`k-button--${this.options.size}`);
        }
        if (this.options.glow) {
            this.element.classList.add('k-button--glow');
        }
        if (this.options.block) {
            this.element.classList.add('k-button--block');
        }
        if (this.options.loading) {
            this.element.classList.add('k-button--loading');
        }
    }

    public updateOptions(newOptions: Partial<ButtonOptions>) {
        this.options = { ...this.options, ...newOptions };
        this.updateClasses();
        this.element.disabled = !!this.options.disabled || !!this.options.loading;
        
        if (this.loaderEl) {
            this.loaderEl.style.display = this.options.loading ? 'inline-block' : 'none';
        }
        if (this.options.text !== undefined && this.contentWrapper) {
            this.contentWrapper.textContent = this.options.text;
        }
    }

    public getElement() {
        return this.element;
    }

    public unmount() {
        this.element.removeEventListener('click', this.handleClick);
        this.element.innerHTML = '';
        this.element.className = '';
        this.element.disabled = false;
    }
}