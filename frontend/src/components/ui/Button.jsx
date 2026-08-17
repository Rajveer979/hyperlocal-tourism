export default function Button({ variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
  }
  return <button className={`${variants[variant]} ${className}`} {...props} />
}
