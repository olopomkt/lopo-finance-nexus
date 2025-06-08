
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
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
				sans: ['Open Sans', 'system-ui', 'sans-serif'],
				florence: ['MADE Florence Sans', 'serif'],
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
				neon: {
					blue: '#00D4FF',
					purple: '#8B5CF6',
					cyan: '#06FFA5',
					pink: '#FF006E'
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
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'glow': {
					'0%, 100%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.5)' },
					'50%': { boxShadow: '0 0 30px rgba(0, 212, 255, 0.8)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'pulse-neon': {
					'0%, 100%': { 
						boxShadow: '0 0 5px rgba(139, 92, 246, 0.5), 0 0 10px rgba(139, 92, 246, 0.5), 0 0 20px rgba(139, 92, 246, 0.5)' 
					},
					'50%': { 
						boxShadow: '0 0 10px rgba(139, 92, 246, 0.8), 0 0 20px rgba(139, 92, 246, 0.8), 0 0 40px rgba(139, 92, 246, 0.8)' 
					}
				},
				'star-movement-bottom': {
					'10%': { transform: 'translate(0%, 0%)', opacity: '1' },
					'100%': { transform: 'translate(-100%, 0%)', opacity: '0' },
				},
				'star-movement-top': {
					'100%': { transform: 'translate(0%, 0%)', opacity: '1' },
					'10%': { transform: 'translate(100%, 0%)', opacity: '0' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'glow': 'glow 2s ease-in-out infinite',
				'float': 'float 3s ease-in-out infinite',
				'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
				'star-movement-bottom': 'star-movement-bottom linear infinite alternate',
				'star-movement-top': 'star-movement-top linear infinite alternate',
			},
			backgroundImage: {
				'gradient-neon': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
				'gradient-dark': 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
