
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
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Indian tricolor inspired theme
				saffron: {
					50: '#fff8f1',
					100: '#ffecd1',
					200: '#ffd89f',
					300: '#ffbd6d',
					400: '#ff9a3b',
					500: '#ff7700',
					600: '#e65c00',
					700: '#b34700',
					800: '#803300',
					900: '#4d1f00'
				},
				green: {
					50: '#f0fff4',
					100: '#c6f6d5',
					200: '#9ae6b4',
					300: '#68d391',
					400: '#48bb78',
					500: '#38a169',
					600: '#2f855a',
					700: '#276749',
					800: '#22543d',
					900: '#1a202c'
				},
				navy: {
					50: '#f7fafc',
					100: '#edf2f7',
					200: '#e2e8f0',
					300: '#cbd5e0',
					400: '#a0aec0',
					500: '#718096',
					600: '#4a5568',
					700: '#2d3748',
					800: '#1a202c',
					900: '#000080'
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
				'blockchain-pulse': {
					'0%, 100%': { 
						boxShadow: '0 0 0 0 rgba(255, 119, 0, 0.7)' 
					},
					'50%': { 
						boxShadow: '0 0 0 10px rgba(255, 119, 0, 0)' 
					}
				},
				'secure-glow': {
					'0%, 100%': { 
						boxShadow: '0 0 20px rgba(56, 161, 105, 0.5)' 
					},
					'50%': { 
						boxShadow: '0 0 40px rgba(56, 161, 105, 0.8)' 
					}
				},
				'vote-cast': {
					'0%': { 
						transform: 'scale(1)',
						opacity: '1' 
					},
					'50%': { 
						transform: 'scale(1.1)',
						opacity: '0.8' 
					},
					'100%': { 
						transform: 'scale(1)',
						opacity: '1' 
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'blockchain-pulse': 'blockchain-pulse 2s ease-in-out infinite',
				'secure-glow': 'secure-glow 3s ease-in-out infinite',
				'vote-cast': 'vote-cast 0.6s ease-in-out'
			},
			backgroundImage: {
				'indian-gradient': 'linear-gradient(135deg, #ff7700 0%, #ffffff 50%, #38a169 100%)',
				'blockchain-mesh': 'radial-gradient(circle at 25% 25%, rgba(255, 119, 0, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(56, 161, 105, 0.1) 0%, transparent 50%)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
