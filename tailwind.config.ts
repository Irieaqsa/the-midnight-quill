import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		fontFamily: {
  			display: [
  				'Inter',
  				'sans-serif'
  			],
  			body: [
  				'Inter',
  				'sans-serif'
  			],
  			sans: [
  				'Inter',
  				'sans-serif'
  			],
  			serif: [
  				'Inter',
  				'sans-serif'
  			],
  			mono: [
  				'JetBrains Mono',
  				'monospace'
  			]
  		},
  		fontSize: {
  			reading: [
  				'1.125rem',
  				{
  					lineHeight: '1.85',
  					letterSpacing: '0.01em'
  				}
  			]
  		},
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			ink: 'hsl(var(--ink))',
  			coral: 'hsl(var(--coral))',
  			amber: 'hsl(var(--amber))',
  			sage: 'hsl(var(--sage))',
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0',
  					opacity: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)',
  					opacity: '1'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)',
  					opacity: '1'
  				},
  				to: {
  					height: '0',
  					opacity: '0'
  				}
  			},
  			'fade-in': {
  				from: {
  					opacity: '0'
  				},
  				to: {
  					opacity: '1'
  				}
  			},
  			'fade-up': {
  				from: {
  					opacity: '0',
  					transform: 'translateY(8px)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'fade-down': {
  				from: {
  					opacity: '0',
  					transform: 'translateY(-8px)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'slide-in': {
  				from: {
  					opacity: '0',
  					transform: 'translateX(-8px)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'translateX(0)'
  				}
  			},
  			'slide-up': {
  				from: {
  					opacity: '0',
  					transform: 'translateY(16px)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'scale-in': {
  				from: {
  					opacity: '0',
  					transform: 'scale(0.95)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'scale(1)'
  				}
  			},
  			'scale-bounce': {
  				'0%': {
  					transform: 'scale(1)'
  				},
  				'50%': {
  					transform: 'scale(1.05)'
  				},
  				'100%': {
  					transform: 'scale(1)'
  				}
  			},
  			'pulse-soft': {
  				'0%, 100%': {
  					opacity: '1'
  				},
  				'50%': {
  					opacity: '0.7'
  				}
  			},
  			'page-enter': {
  				from: {
  					opacity: '0',
  					transform: 'translateY(6px)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			shimmer: {
  				'0%': {
  					backgroundPosition: '-200% 0'
  				},
  				'100%': {
  					backgroundPosition: '200% 0'
  				}
  			},
  			float: {
  				'0%, 100%': {
  					transform: 'translateY(0)'
  				},
  				'50%': {
  					transform: 'translateY(-4px)'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.25s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'fade-in': 'fade-in 0.3s ease-out',
  			'fade-up': 'fade-up 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
  			'fade-down': 'fade-down 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
  			'slide-in': 'slide-in 0.3s ease-out',
  			'slide-up': 'slide-up 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
  			'scale-in': 'scale-in 0.2s ease-out',
  			'scale-bounce': 'scale-bounce 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  			'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
  			'page-enter': 'page-enter 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
  			shimmer: 'shimmer 2s linear infinite',
  			float: 'float 3s ease-in-out infinite'
  		},
  		transitionTimingFunction: {
  			smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
  			bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
  		},
  		boxShadow: {
  			'2xs': 'var(--shadow-2xs)',
  			xs: 'var(--shadow-xs)',
  			sm: 'var(--shadow-sm)',
  			md: 'var(--shadow-md)',
  			lg: 'var(--shadow-lg)',
  			xl: 'var(--shadow-xl)',
  			'2xl': 'var(--shadow-2xl)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
