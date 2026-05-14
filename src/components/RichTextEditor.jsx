import React, { useRef, useState, useEffect } from 'react';

const RichTextEditor = ({ value, onChange, placeholder = '', maxLength = 10000, name }) => {
    const editorRef = useRef(null);
    const [characterCount, setCharacterCount] = useState(0);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [linkUrl, setLinkUrl] = useState('https://');
    const [storedSelection, setStoredSelection] = useState(null);
    
    const [activeStyles, setActiveStyles] = useState({
        bold: false,
        italic: false,
        underline: false,
        ul: false,
        ol: false,
        h3: false,
        h4: false,
    });

    // Sync external value to internal contentEditable only when it actually changes externally
    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== (value || '')) {
            editorRef.current.innerHTML = value || '';
        }
    }, [value]);

    const updateActiveStyles = () => {
        const isH3 = document.queryCommandValue('formatBlock') === 'h3';
        const isH4 = document.queryCommandValue('formatBlock') === 'h4';
        
        setActiveStyles({
            bold: document.queryCommandState('bold') && !isH3 && !isH4,
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline'),
            ul: document.queryCommandState('insertUnorderedList'),
            ol: document.queryCommandState('insertOrderedList'),
            h3: isH3,
            h4: isH4,
        });
    };

    const execCommand = (command, val = null) => {
        if (editorRef.current) {
            editorRef.current.focus();
        }
        document.execCommand(command, false, val);
        handleInput();
        updateActiveStyles();
    };

    const handleInput = () => {
        if (editorRef.current) {
            const content = editorRef.current.innerHTML;
            setCharacterCount(countCharacters(content));
            // Pass the value directly as a string to avoid [object Object] errors
            if (typeof onChange === 'function') {
                onChange(content);
            }
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        // Get HTML if available, fallback to plain text
        const html = e.clipboardData.getData('text/html');
        const text = e.clipboardData.getData('text/plain');
        
        if (html) {
            // Use execCommand to insert the HTML at current cursor position
            document.execCommand('insertHTML', false, html);
        } else {
            document.execCommand('insertText', false, text);
        }
        handleInput();
    };

    const countCharacters = (content) => {
        if (!content) return 0;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        return tempDiv.innerText.length;
    };

    const openLinkModal = () => {
        // Save selection because browser loses it when focus moves to modal
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            setStoredSelection(selection.getRangeAt(0).cloneRange());
        }
        setShowLinkModal(true);
    };

    const confirmLink = (e) => {
        e.preventDefault();
        if (linkUrl) {
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(storedSelection);
            
            execCommand('createLink', linkUrl);
            setLinkUrl('https://');
            setShowLinkModal(false);
            setStoredSelection(null);
        }
    };

    const formatBlock = (tag) => {
        const currentBlock = document.queryCommandValue('formatBlock');
        if (currentBlock === tag) {
            execCommand('formatBlock', '<p>');
        } else {
            execCommand('formatBlock', `<${tag}>`);
        }
    };

    return (
        <div className="admin-rich-editor-v2">
            <style>{`
                .admin-rich-editor-v2 {
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    overflow: hidden;
                    background: #fff;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                }
                .admin-rich-toolbar {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px;
                    padding: 8px;
                    background: #f8fafc;
                    border-bottom: 1px solid #e2e8f0;
                }
                .admin-rich-toolbar button {
                    height: 32px;
                    width: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid transparent;
                    background: none;
                    border-radius: 4px;
                    color: #64748b;
                    cursor: pointer;
                    font-size: 13px;
                    transition: all 0.2s;
                }
                .admin-rich-toolbar button:hover {
                    background: #f1f5f9;
                    color: #1769e8;
                }
                .admin-rich-toolbar button.active {
                    background: #e2e8f0;
                    color: #1769e8;
                    border-color: #cbd5e1;
                    font-weight: 600;
                }
                .admin-rich-toolbar .separator {
                    width: 1px;
                    height: 20px;
                    background: #e2e8f0;
                    margin: 6px 4px;
                }
                .admin-rich-content {
                    width: 100%;
                    min-height: 300px;
                    max-height: 500px;
                    padding: 20px;
                    overflow-y: auto;
                    font-family: inherit;
                    font-size: 14px;
                    line-height: 1.6;
                    color: #1e293b;
                }
                .admin-rich-content:focus {
                    outline: none;
                }
                .admin-rich-content ul { list-style-type: disc; margin-left: 20px; padding-left: 10px; }
                .admin-rich-content ol { list-style-type: decimal; margin-left: 20px; padding-left: 10px; }
                .admin-rich-content h3 { font-size: 1.25rem; font-weight: 600; margin: 0.5em 0; }
                .admin-rich-content h4 { font-size: 1.1rem; font-weight: 600; margin: 0.5em 0; }
                
                /* Link Modal Styles */
                .rich-link-modal-overlay {
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(255,255,255,0.8);
                    backdrop-filter: blur(2px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10;
                }
                .rich-link-modal {
                    background: white;
                    padding: 20px;
                    border-radius: 12px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                    border: 1px solid #e2e8f0;
                    width: 90%;
                    max-width: 350px;
                }
                .rich-link-modal h5 { margin: 0 0 15px 0; font-size: 14px; color: #1e293b; }
                .rich-link-modal input {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    margin-bottom: 15px;
                    font-size: 13px;
                }
                .rich-link-modal-actions { display: flex; gap: 8px; justify-content: flex-end; }
                .rich-link-modal-actions button {
                    padding: 6px 14px;
                    border-radius: 6px;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .rich-link-modal-actions .cancel { background: #f1f5f9; border: 1px solid #e2e8f0; color: #64748b; }
                .rich-link-modal-actions .confirm { background: #1769e8; border: 1px solid #1769e8; color: white; }
                .rich-link-modal-actions .confirm:hover { background: #1d4ed8; }

                .admin-rich-footer {
                    padding: 8px 12px;
                    background: #f8fafc;
                    border-top: 1px solid #e2e8f0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 11px;
                    color: #94a3b8;
                }
            `}</style>

            <div className="admin-rich-toolbar">
                <button type="button" className={activeStyles.bold ? 'active' : ''} onClick={() => execCommand('bold')} title="Bold"><b>B</b></button>
                <button type="button" className={activeStyles.italic ? 'active' : ''} onClick={() => execCommand('italic')} title="Italic"><i>I</i></button>
                <button type="button" className={activeStyles.underline ? 'active' : ''} onClick={() => execCommand('underline')} title="Underline"><u>U</u></button>
                <div className="separator"></div>
                <button type="button" className={activeStyles.h3 ? 'active' : ''} onClick={() => formatBlock('h3')} title="Heading 3">H3</button>
                <button type="button" className={activeStyles.h4 ? 'active' : ''} onClick={() => formatBlock('h4')} title="Heading 4">H4</button>
                <button type="button" onClick={() => formatBlock('p')} title="Paragraph">P</button>
                <div className="separator"></div>
                <button type="button" className={activeStyles.ul ? 'active' : ''} onClick={() => execCommand('insertUnorderedList')} title="Bullet List"><i className="fa-solid fa-list-ul"></i></button>
                <button type="button" className={activeStyles.ol ? 'active' : ''} onClick={() => execCommand('insertOrderedList')} title="Numbered List"><i className="fa-solid fa-list-ol"></i></button>
                <div className="separator"></div>
                <button type="button" onClick={openLinkModal} title="Insert Link"><i className="fa-solid fa-link"></i></button>
                <button type="button" onClick={() => execCommand('unlink')} title="Remove Link"><i className="fa-solid fa-link-slash"></i></button>
            </div>

            <div 
                ref={editorRef}
                className="admin-rich-content"
                contentEditable={true}
                onInput={handleInput}
                onBlur={handleInput}
                onPaste={handlePaste}
                onMouseUp={updateActiveStyles}
                onKeyUp={updateActiveStyles}
                data-placeholder={placeholder}
            ></div>

            {showLinkModal && (
                <div className="rich-link-modal-overlay" onClick={() => setShowLinkModal(false)}>
                    <form className="rich-link-modal" onClick={e => e.stopPropagation()} onSubmit={confirmLink}>
                        <h5>Insert Hyperlink</h5>
                        <input 
                            type="url" 
                            value={linkUrl} 
                            onChange={e => setLinkUrl(e.target.value)} 
                            placeholder="Enter URL (https://...)" 
                            autoFocus
                            required 
                        />
                        <div className="rich-link-modal-actions">
                            <button type="button" className="cancel" onClick={() => setShowLinkModal(false)}>Cancel</button>
                            <button type="submit" className="confirm">Insert Link</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="admin-rich-footer">
                <span>Supports rich formatting, bullet points, and headings.</span>
                <span className={characterCount > maxLength ? 'text-red-500' : ''}>
                    Characters: {characterCount}/{maxLength}
                </span>
            </div>
        </div>
    );
};

export default RichTextEditor;
