import 'styled-components'

declare module 'styled-components' {
    export interface DefaultTheme {
        background: string
        border: string
        backgroundAlt: string
        borderAlt: string
        text: string
        buttonText: string
        primary: string
        inactive: string
        chartLine: string
        inactiveLegend: string
        tooltipLabel: string
        chartDataZoomBackground: string
        toggleBackground: string
        primary1: string
        primary2: string
        activeMenu: string
        inactiveMenu: string
        platformBackground: string
        platformText: string
        leaving: string
        arriving: string
    }
} 