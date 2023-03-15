import { useEffect, useRef } from 'react';
import { createApp } from 'vue';

export const useMountVueComponent = (Component) => {
    const el = useRef(null);

    useEffect(() => {
        if (el.current) {
            const app = createApp(Component);
            app.mount(el.current);
        }
    }, [el]);

    return el;
}