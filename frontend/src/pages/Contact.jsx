import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Get in Touch</h1>
        <p className="text-xs text-slate-500 mt-2">
          Questions regarding inventory sync, seller registration, or college capstone evaluation? We are here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle flex items-start space-x-3">
            <div className="p-2.5 bg-royal-50 text-royal-600 rounded-xl">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900">Email Support</h4>
              <p className="text-xs text-slate-500 mt-0.5">lsiri4429@gmail.com</p>
              <p className="text-[10px] text-slate-400 mt-1">Available 24/7 for evaluations</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle flex items-start space-x-3">
            <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900">Direct Helpline</h4>
              <p className="text-xs text-slate-500 mt-0.5">+91 (011) 4988-2900</p>
              <p className="text-[10px] text-slate-400 mt-1">Mon-Fri, 9:00 AM - 6:00 PM IST</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle flex items-start space-x-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900">Engineering Campus</h4>
              <p className="text-xs text-slate-500 mt-0.5">Dept. of Computer Science & Engineering</p>
              <p className="text-[10px] text-slate-400 mt-1">B.Tech MERN Stack Capstone Project</p>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-card">
          {submitted ? (
            <div className="text-center py-12 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-teal-500 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900">Message Dispatched!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Thank you for your message. Our engineering team has received your inquiry.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Lakshmi Siri"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-royal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="lakshmi@domain.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-royal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Inquiry Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Question regarding atomic inventory sync"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-royal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your inquiry in detail..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-royal-500"
                />
              </div>

              <button
                type="submit"
                className="py-3 px-6 bg-navy-900 hover:bg-royal-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center space-x-2"
              >
                <span>Submit Inquiry</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
