"use client"
import React, { useState } from 'react'
import FormWrapper from '../FormWrapper'
import { Switch } from '@heroui/react'

const SignalEnrichment = () => {
    const [sources, setSources] = useState([
        { label: "Monitoring (Datadog/Prometheus/CloudWatch", value: false },
        { label: "Logs (ELK / OpenSearch)", value: false },
        { label: "Runtime (Kubernetes / containers)", value: false },
        { label: "Databases & warehouses", value: false },
        { label: "Fraud metrics & signals", value: false },
        { label: "Enrichment increases accuracy of blast radius, customer impact, and executive summaries.", value: false },
    ])
    return (
        <div>
            <FormWrapper
                title='D. Signal enrichment (optional)'
                subtitle='Make incidents signal-rich and fraud-aware by default.'
                label='These are defaults. Users still configure integrations on the next step.'
                // actionText={"Add auto-create rule"}
            // action={() => setOpenModal(true)}
            >
                <div className='border border-gray-400 p-3 rounded-lg space-y-3'>
                    <p className='text-sm font-semibold'>Default enrichment sources</p>
                    <div className='space-y-2'>
                        {
                            sources.map((source) => (
                                <div key={source.label} className='flex items-center justify-between'>
                                    <p className='text-sm'>{source.label}</p>
                                    <Switch size='sm' color="success" checked={source.value} onChange={(e) => setSources((prev) =>
                                        prev.map((item) =>
                                            item.label === source.label
                                                ? { ...item, value: !source.value } // Update the matched item
                                                : item // Keep others as they are
                                        )
                                    )} />
                                </div>
                            ))
                        }
                    </div>
                </div>
            </FormWrapper>
        </div>
    )
}

export default SignalEnrichment